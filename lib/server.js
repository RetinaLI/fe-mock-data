#!/usr/bin/env node
let path = require('path');
let fs = require('fs');
let app;
let config = require('../config');
let colors = require('colors');
const MOCK_LIB = require('../lib/main');

let getExtLib = function () {
  return {
    path: path,
    fs: fs,
    __dirname: __dirname,
    getPageData: MOCK_LIB.getPageData
  }
};

let parseRoutes = function (serverConfig) {
  let routesMap = serverConfig.routes;
  console.info(('parse routes: (' + Object.keys(routesMap).length + '个)').bgGreen);
  Object.keys(routesMap).forEach(key => {
    let routeConfig = MOCK_LIB.parseRouteConfig(routesMap[key]);

    // 以websocket为分界
    if (routeConfig.method === 'ws') {
      app.ws(routeConfig.url, (ws, req) => {
        let dataRes = MOCK_LIB.getResponseData(routeConfig);

        if (routeConfig.renderFn) {
          routeConfig.renderFn(dataRes, ws, req, getExtLib());
        } else if (routeConfig.json) {
          dataRes = JSON.stringify(dataRes);
          let intervalId = setInterval(() => {
            try {
              ws.send(dataRes);
            } catch (ex) {
              console.info(ex.message.error);
            } finally {
              clearInterval(intervalId);
            }
          }, routeConfig.interval);

          ws.on('message', (msg) => {
            console.log("收到" + key + "发来的数据：" + msg);
          });

          ws.on('close', function () {
            clearInterval(intervalId);
          });
        };
      });
    } else {
      // 非websocket
      app[routeConfig.method](routeConfig.url, (req, res) => {
        let dataRes = MOCK_LIB.getResponseData(routeConfig, req);
        if (routeConfig.renderFn) {
          routeConfig.renderFn(dataRes, req, res, getExtLib());
        } else {
          res.status(routeConfig.callbackStatus).send(dataRes);
        }
      });
    }

    console.info(('     (' + routeConfig.method + ') ' + routeConfig.url).green);
  });
};

let initStaticPath = function (serverConfig) {
  if (!serverConfig.publicPath || !serverConfig.publicName) return;
  let express = require('express');
  app.use(serverConfig.publicName, express.static(serverConfig.publicPath));
};

let initExpressApp = function (opt) {
  if (!opt.app) {
    let express = require('express');
    app = express();
    app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
      next();
    });
  } else {
    app = opt.app;
  }
  let bodyParser = require('body-parser');
  let expressWs = require('express-ws')(app);

  app = expressWs.app;
  app.use(bodyParser.urlencoded({
    extended: false,
    limit: '50mb'
  }));
};

let start = function (opt = {
  port: config.port,
  path: config.config,
  app: null
}) {
  let serverConfig = require(path.join(path.resolve('.'), opt.path));

  initExpressApp(opt);
  initStaticPath(serverConfig);
  parseRoutes(serverConfig);

  return (new Promise((resolve) => {
    app.listen(opt.port, () => {
      resolve();
    });
  })).then(() => {
    console.info(`mock server is ok!`.bgGreen);
    return true;
  }, () => {
    console.info(`mock server has failed!`.red);
    return false;
  });
};


module.exports = {
  start
};