#!/usr/bin/env node
let path = require('path');
let fs = require('fs');
let config = require('../config');
let colors = require('colors');
const MOCK_LIB = require('../lib/main');
let watch = require('node-watch');
let key = Date.now();

let watcher, app, server;

let getExtLib = function () {
  return {
    path: path,
    fs: fs,
    __dirname: __dirname
  }
};

let restartApp = function (opt) {
  console.info('mock server restarting!'.green);
  if (server) {
    console.info('old mock server closing!'.green);
    server.close(() => {
      console.info('old mock server closed!'.green);
      console.info('new mock server starting!'.green);
      start(opt);
    });
  } else {
    start(opt);
  }
};

let startWatchConfig = function (opt) {
  watcher = watch(path.dirname(path.join(path.resolve('.'), opt.path)), { filter: /\.js$/ }, function (evt, name) {
    console.info('file changed: '.blue + name.green);
    key = Date.now();
    delete require.cache[require.resolve(path.join(path.resolve('.'), opt.path))];
    restartApp(opt);
  });
  console.info('file watching: '.blue + path.dirname(path.join(path.resolve('.'), opt.path)).green);
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
          try {
            routeConfig.renderFn(dataRes, ws, req, getExtLib());
          } catch (ex) {
            console.info(`error:`.bgRed + ` ${key} ${routeConfig.url} ${ex.message}`.red);
          }
        } else if (routeConfig.json) {
          dataRes = JSON.stringify(dataRes);
          let intervalId = setInterval(() => {
            try {
              if (ws.readyState === 1) {
                ws.send(dataRes);
              } else {
                clearInterval(intervalId);
              }
            } catch (ex) {
              console.info(ex.message.error);
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
          try {
            routeConfig.renderFn(dataRes, req, res, getExtLib());
          } catch (ex) {
            console.info(`error:`.bgRed + ` ${key} ${routeConfig.url} ${ex.message}`.red);
          }
        } else {
          res.status(routeConfig.statusCode).send(dataRes);
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
  enableWatch: false,
  app: null
}) {
  let currentKey = key;
  opt.enableWatch = opt.app ? false : opt.enableWatch;
  // 进行import编译
  require('babel-register')({
    plugins: ['babel-plugin-transform-es2015-modules-commonjs'],
  })
  let serverConfig = require(path.join(path.resolve('.'), opt.path));
  // 只支持 export default {} 或者 module.exports方式;
  serverConfig = serverConfig.default || serverConfig;
  initExpressApp(opt);
  initStaticPath(serverConfig);
  parseRoutes(serverConfig);

  return (new Promise((resolve) => {
    if (!opt.app) {
      if (key !== currentKey) return resolve(2);
      server = app.listen(opt.port, () => {
        resolve();
      });

      if (opt.enableWatch && !watcher) {
        startWatchConfig(opt);
      }
    } else {
      resolve();
    }
  })).then((result) => {
    if (result === 2) return;
    console.info(`mock server is ok!`.bgGreen, `http://localhost:${opt.port}`.underline.cyan);
    return true;
  }, () => {
    console.info(`mock server has failed!`.red);
    return false;
  });
};


module.exports = {
  start
};