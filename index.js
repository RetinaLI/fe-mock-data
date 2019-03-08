#!/usr/bin/env node
let express = require('express');
let path = require('path');
let fs = require('fs');
let bodyParser = require('body-parser');
let app = express();
let router = express.Router();
let init = require('./bin/init.js');
let program = require('commander');
let packageInfo = require('./package.json');

let expressWs = require('express-ws')(app);
app = expressWs.app;

let ext = {
  path: path,
  fs: fs,
  __dirname: __dirname,
  getPageData: function (arrayData, pageIndex, pageSize, startPage) {
    let pageData = [];
    if (arrayData && arrayData.length > 0) {
      if (startPage === 0) {
        pageData = arrayData.slice(pageSize * pageIndex, (pageIndex + 1) * pageSize);
      } else {
        pageData = arrayData.slice(pageSize * (pageIndex - 1), pageIndex * pageSize);
      }
      return pageData;
    }
  }
};

// 返回数据公共代码提取
function getCommResult (pageConfig, json, getOrPost, req, res) {
  let config = pageConfig;
  let pIndex, pSize, pList, startIndex;

  pIndex = config.pageIndex ? config.pageIndex : 'pageIndex';
  pSize = config.pageSize ? config.pageSize : 'pageSize';
  pList = config.listName ? config.listName : 'data';
  startIndex = config.startIndex ? config.startIndex: 0;

  let reg = /^[1-9]\d*|0$/;
  let rightIndex;
  let rightSize;

  if (getOrPost === 'get') {
    rightIndex = reg.test(parseInt(req.query[pIndex]));
    rightSize = reg.test(parseInt(req.query[pSize]));
  } else if (getOrPost === 'post') {
    rightIndex = reg.test(parseInt(req.body[pIndex]));
    rightSize = reg.test(parseInt(req.body[pSize]));
  }

  if ( rightIndex && rightSize && getOrPost === 'get') {
    dataRes = getPageData(json, req.query[pIndex], req.query[pSize], pList, startIndex);
  } else if ( rightIndex && rightSize && getOrPost === 'post') {
    dataRes = getPageData(json, req.body[pIndex], req.body[pSize], pList, startIndex);
  } else {
    dataRes = fs.readFileSync(path.join(path.resolve('.'), json));
    dataRes = JSON.parse(dataRes)
  }
  return dataRes;
}
// 获取分页数据
function getPageData (urlConfig, pageIndex, pageSize, listName, startPage) {

  var result = fs.readFileSync(path.join(path.resolve('.'), urlConfig));
  if (result) {
    result = result.toString();
    var resJson = JSON.parse(result);
    var list = resJson;
    let pageData = [];
    let keyName = listName || 'data';

    let arr = keyName.split('.');
    let temp = [];

    if (arr.length > 0) {
      for (let k = 0; k < arr.length;  k++) {
        list = list[arr[k]];
      }
    }

    if (startPage === 0) {
      pageData = list.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
    } else {
      pageData = list.slice((pageIndex - 1) * pageSize, pageIndex * pageSize);
    }

    if (arr.length === 1) {
      resJson[arr[0]] = pageData;
    } else {
      for (let k = 0; k < arr.length - 1;  k++) {
        temp = resJson[arr[k]];
      }
      temp[arr.pop()] = pageData;
    }
    return resJson;
  }
}
// 获取json全部数据，不分页
function getJsonNoPage (json) {
  dataRes = fs.readFileSync(path.join(path.resolve('.'), json));
  dataRes = JSON.parse(dataRes);
  return dataRes;
}

// 返回dataRes
function returnData(jsonConfig, method, req, res, pagingConfig) {
  if (!pagingConfig) {
    dataRes = getJsonNoPage(jsonConfig);
    return dataRes;
  }
  dataRes = getCommResult(pagingConfig, jsonConfig, method, req, res);
  return dataRes;
}

program
  .version(packageInfo.version)
  .option('-p, --path [path]', '配置文件路径', '\/mock-data\/config.js')
  .option('-P, --port [port]', '配置端口号', 4200)
  .parse(process.argv);

program
  .command('init')
  .description('初始化mock-server文件夹')
  .action(function() {
    init.fun();
  })

program
  .command('run')
  .description('运行模拟后台数据')
  .action(function() {

    let port = program.port;
    let serverConfig = require(path.join(path.resolve('.'), program.path));
    if (serverConfig.publicPath) {
      app.use('/public', express.static(path.join(path.resolve(''), serverConfig.publicPath)));
    }

    app.use(bodyParser.urlencoded({
      extended: false,
      limit: '50mb'
    }));

    router.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept');
      res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
      next();
    });
    router.get('/', (req, res) => {
      res.status(200).send('success');
    });

    let routesMap = serverConfig.routes;
    Object.keys(routesMap).forEach(key => {
      let method = routesMap[key].method ? routesMap[key].method : 'get';
      let route =  routesMap[key].url || '/';
      let callbackStatus = routesMap[key].callbackStatus ? routesMap[key].callbackStatus : 200;
      let dataRes;
      if (typeof method !== 'string') {throw Error('配置请求方式错误，必须为get/post/ws其中一种')};
      method = method.toLowerCase();
      if (method !== 'get' &&  method !== 'post' && method !== 'ws') { throw Error('配置请求方式错误，必须为get/post/ws其中一种')};
      if (callbackStatus !== 200 && callbackStatus !== 404) { throw Error('状态码设置必须为200或404')};
      // 以websocket为分界
      if (method === 'ws') {
        router.ws(route, (ws, req) => {
          if (routesMap[key].interval && typeof routesMap[key].interval !== 'number') { throw Error('此项必须为number类型'); };
          if (routesMap[key].renderFn) {
            dataRes = null;
            if (routesMap[key].json) dataRes = getJsonNoPage(routesMap[key].json);
            routesMap[key].renderFn(dataRes, ws, req, ext);
          } else if (routesMap[key].json) {
            dataRes = getJsonNoPage(routesMap[key].json);
            dataRes = JSON.stringify(dataRes);
            let intervalSet = routesMap[key].interval ? routesMap[key].interval : 5000;
            let intervalId = setInterval(() => {
              ws.send(dataRes);
            }, intervalSet);
            ws.on('message', (msg) => {
              console.log("收到"+ key + "发来的数据：" + msg);
            });
            ws.on('close', function() {
              clearInterval(intervalId);
            });
          };
        });
      } else {
        // 非websocket
        let paginationQueryConfig = routesMap[key].paginationQueryConfig ? routesMap[key].paginationQueryConfig : null;

        let fn = routesMap[key].renderFn ? (req, res) => {
          dataRes = null;
          if (routesMap[key].json) dataRes = returnData(routesMap[key].json, method, req, res, paginationQueryConfig);
          routesMap[key].renderFn(dataRes, req, res, ext);
        } : (req, res) => {
          dataRes = returnData(routesMap[key].json, method, req, res, paginationQueryConfig);
          if (callbackStatus === 404) {dataRes = new Error('404 Not Found').message };
          res.status(callbackStatus).send(dataRes);
        };
        router[method](route, fn);
      }
    });
    app.use(router);
    app.listen(port, () => {
      console.info(`mock server success! please visit: http://localhost:${port}/***`);
    });
  })

program.parse(process.argv);

