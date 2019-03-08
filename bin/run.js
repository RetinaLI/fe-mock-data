#!/usr/bin/env node
let path = require('path');
let fs = require('fs');
let bodyParser = require('body-parser');
let program = require('commander');
let packageInfo = require('../package.json');

program
.version(packageInfo.version)
.option('-p, --path [path]', '配置文件路径', '..\/mock-data\/config.js')
.option('-P, --port [port]', '配置端口号', 4200)
.parse(process.argv);

let port = program.port;

// module.exports.run = function () {
  console.log(path.resolve('.'));
  let serverConfig = require(path.join(path.resolve('.'), program.path));

  // if (serverConfig.publicPath) {
  //   app.use('/public', express.static(path.join(path.resolve(''), serverConfig.publicPath)));
  // }

  // app.use(bodyParser.urlencoded({
  //   extended: false,
  //   limit: '50mb'
  // }));

  // router.use((req, res, next) => {
  //   res.header('Access-Control-Allow-Origin', '*');
  //   res.header('Access-Control-Allow-Headers',
  //     'Origin, X-Requested-With, Content-Type, Accept');
  //   res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
  //   next();
  // });
  // router.get('/', (req, res) => {
  //   res.status(200).send('success');
  // });

  // let routesMap = serverConfig.routes;
  // Object.keys(routesMap).forEach(key => {
  //   let method = routesMap[key].method ? routesMap[key].method : 'get';
  //   let route =  routesMap[key].url || '/';
  //   let callbackStatus = routesMap[key].callbackStatus ? routesMap[key].callbackStatus : 200;
  //   let dataRes;
  //   if (typeof method !== 'string') {throw Error('配置请求方式错误，必须为get/post/ws其中一种')};
  //   method = method.toLowerCase();
  //   if (method !== 'get' &&  method !== 'post' && method !== 'ws') { throw Error('配置请求方式错误，必须为get/post/ws其中一种')};
  //   if (callbackStatus !== 200 && callbackStatus !== 404) { throw Error('状态码设置必须为200或404')};
  //   // 以websocket为分界
  //   if (method === 'ws') {
  //     router.ws(route, (ws, req) => {
  //       if (routesMap[key].interval && typeof routesMap[key].interval !== 'number') { throw Error('此项必须为number类型'); };
  //       if (routesMap[key].renderFn) {
  //         dataRes = null;
  //         if (routesMap[key].json) dataRes = getJsonNoPage(routesMap[key].json);
  //         routesMap[key].renderFn(dataRes, ws, req, ext);
  //       } else if (routesMap[key].json) {
  //         dataRes = getJsonNoPage(routesMap[key].json);
  //         dataRes = JSON.stringify(dataRes);
  //         let intervalSet =  routesMap[key].interval ? routesMap[key].interval : 5000;
  //         setInterval(() => {
  //           ws.send(dataRes);
  //         }, intervalSet);
  //         ws.on('message', (msg) => {
  //           console.log("收到"+ routesMap[key] + "发来的数据：" + msg);
  //         });
  //       }
  //     });
  //   } else {
  //     // 非websocket
  //     let paginationQueryConfig = routesMap[key].paginationQueryConfig ? routesMap[key].paginationQueryConfig : null;

  //     let fn = routesMap[key].renderFn ? (req, res) => {
  //       dataRes = null;
  //       if (routesMap[key].json) dataRes = returnData(routesMap[key].json, method, req, res, paginationQueryConfig);
  //       routesMap[key].renderFn(dataRes, req, res, ext);
  //     } : (req, res) => {
  //       dataRes = returnData(routesMap[key].json, method, req, res, paginationQueryConfig);
  //       if (callbackStatus === 404) {dataRes = new Error('404 Not Found').message };
  //       res.status(callbackStatus).send(dataRes);
  //     };
  //     router[method](route, fn);
  //   }
  // });
  // app.use(router);
  // app.listen(port, () => {
  //   console.info(`mock server success! please visit: http://localhost:${port}/***`);
  // });

// };