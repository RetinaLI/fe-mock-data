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
  getPageData: function (arr, p, s, startP) {
    let pageData = [];
    if (arr && arr.length > 0) {
      if (startP === 0) {
        pageData = arr.slice(s * p, (p + 1) * s);
      } else {
        pageData = arr.slice(s * (p - 1), p * s);
      }
      return pageData;
    }
  }
};

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
      let method = routesMap[key].method ? routesMap[key].method.toLowerCase() : 'get';
      let route =  routesMap[key].url || '/';
      let callbackStatus = routesMap[key].callbackStatus || 200;
      let dataRes;
      // 以websocket为分界
      if (method === 'ws' && routesMap[key].json) {
        let wsUrl = route.split("{{prefix}}")[1];
        router.ws(wsUrl, (ws, req) => {
          dataRes = fs.readFileSync(path.join(path.resolve('.'), serverConfig[key].json));
          // dataRes = JSON.stringify(JSON.parse(dataRes));
          dataRes = JSON.parse(dataRes);
          ws.send(dataRes);
          ws.on('message', (msg) => {
            console.log(msg);
            ws.send(msg);
          });
        });

      } else {
        // 非websocket
        let fn = routesMap[key].renderFn ? (req, res) => {
          // 分页
          if (routesMap[key].paginationQueryConfig && routesMap[key].json) {
            let config = routesMap[key].paginationQueryConfig;
            let pIndex, pSize, pList, startIndex;

            pIndex = config.pageIndex || 'pageIndex';
            pSize = config.pageSize || 'pageSize';
            pList = config.listName || 'listName';
            startIndex = config.startIndex || 1;

            let reg = /^[1-9]\d*|0$/;
            let rightIndex;
            let rightSize;

            if (method === 'get') {
              rightIndex = reg.test(parseInt(req.query[pIndex]));
              rightSize = reg.test(parseInt(req.query[pSize]));
            } else if (method === 'post') {
              rightIndex = reg.test(parseInt(req.body[pIndex]));
              rightSize = reg.test(parseInt(req.body[pSize]));
            }

            if ( rightIndex && rightSize && method === 'get') {
              dataRes = getPageData(routesMap[key].json, req.query[pIndex], req.query[pSize], pList, startIndex);
            } else if ( rightIndex && rightSize && method === 'post') {
              dataRes = getPageData(routesMap[key].json, req.body[pIndex], req.body[pSize], pList, startIndex);
            } else {
              dataRes = fs.readFileSync(path.join(path.resolve('.'), routesMap[key].json));
              dataRes = JSON.parse(dataRes)
            }
          } else if (routesMap[key].json) {
            // 非分页
            dataRes = fs.readFileSync(path.join(path.resolve('.'), routesMap[key].json));
            dataRes = JSON.parse(dataRes)
          };
          if (routesMap[key].renderFn && routesMap[key].json) {
            routesMap[key].renderFn(dataRes, req, res, ext);
          } else {
            routesMap[key].renderFn(null, req, res, ext);
          }

        } : (req, res) => {
           // 分页
           if (routesMap[key].paginationQueryConfig && routesMap[key].json) {
            let config = routesMap[key].paginationQueryConfig;
            let pIndex, pSize, pList, startIndex;

            pIndex = config.pageIndex || 'pageIndex';
            pSize = config.pageSize || 'pageSize';
            pList = config.listName || 'listName';
            startIndex = config.startIndex || 1;

            let reg = /^[1-9]\d*|0$/;
            let rightIndex;
            let rightSize;

            if (method === 'get') {
              rightIndex = reg.test(parseInt(req.query[pIndex]));
              rightSize = reg.test(parseInt(req.query[pSize]));
            } else if (method === 'post') {
              rightIndex = reg.test(parseInt(req.body[pIndex]));
              rightSize = reg.test(parseInt(req.body[pSize]));
            }

            if ( rightIndex && rightSize && method === 'get') {
              dataRes = getPageData(routesMap[key].json, req.query[pIndex], req.query[pSize], pList, startIndex);
            } else if ( rightIndex && rightSize && method === 'post') {
              dataRes = getPageData(routesMap[key].json, req.body[pIndex], req.body[pSize], pList, startIndex);
            } else {
              dataRes = fs.readFileSync(path.join(path.resolve('.'), routesMap[key].json));
              dataRes = JSON.parse(dataRes)
            }

          } else if (routesMap[key].json) {
            // 非分页
            dataRes = fs.readFileSync(path.join(path.resolve('.'), routesMap[key].json));
            dataRes = JSON.parse(dataRes)
          };
          if (callbackStatus === 404) {
            let errorInfo = new Error('404 Not Found')
            res.status(callbackStatus).send(errorInfo.message);
          } else {
            res.status(callbackStatus).send(dataRes);
          }
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

function getPageData (url, p, s, listName, startP) {

  var result = fs.readFileSync(path.join(path.resolve('.'), url));
  if (result) {
    var list = result.toString();
    list = JSON.parse(list);

    let pageData = [];
    let keyName = listName || 'data';
    if (keyName.split('.').length > 1) {
      let arr = keyName.split('.');
      for (let k = 0; k < arr.length;  k++) {
        list = list[arr[k]]
      }
    } else {
      list = list[keyName];
    }

    if (startP === 0) {
      pageData = list.slice(s * p, (p + 1) * s);
    } else if (startP === 1) {
      pageData = list.slice(s * (p - 1), p * s);
    }
    return pageData;
  }
}

