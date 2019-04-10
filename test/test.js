let http = require('http');
let fs = require('fs');
let path = require('path');
const querystring = require('querystring');
let config = require('../config');
let server = require('../lib/server');
const MOCK_LIB = require('../lib/main');
let colors = require('colors');
let mock = require('../bin/mock');

let requestWS = function (url) {
  return new Promise(resolve => {
    const WebSocket = require('ws');

    const ws = new WebSocket('ws://localhost:' + config.port + url);

    ws.on('open', function incoming(data) {
      ws.send('hello');
      console.info(url.green, 'open success'.green);
    });
    ws.on('message', function incoming(data) {
      resolve((data));
    });
    ws.on('close', function (data) {
      console.info(url.cyan, ' closed'.cyan);
    });
    ws.on('error', function (data) {
      console.info(url.red, ' connect error success'.red, data.red);
    });
  });
};

let request = function (url, method, params) {
  return new Promise(resolve => {
    const postData = querystring.stringify(params);
    let options = {
      hostname: 'localhost',
      port: config.port,
      path: url,
      agent: false,
      method: method.toUpperCase(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    let req = http.request(options, (res) => {
      res.setEncoding('utf8');
      let data = '';
      res.on('data', (str) => {
        if (method === 'ws') console.info(str);
        data += str;
      });
      res.on('end', () => {
        resolve({ data: data, statusCode: res.statusCode });
      });
    });
    req.on('error', (e) => {
      resolve({ data: e.message, statusCode: req.statusCode });
    });
    req.write(postData);
    req.end();
  });
};

let testApi = async function (key, routeConfig) {
  let params = {};

  if (routeConfig.paginationQueryConfig) {
    params[routeConfig.paginationQueryConfig.pageIndexKey] = 1;
    params[routeConfig.paginationQueryConfig.pageSizeKey] = 2;
  } else {
    params.pageIndex = 1;
    params.pageSize = 2;
  }

  let result;
  if (routeConfig.method === 'ws') {
    result = await requestWS(routeConfig.url);
  } else {
    result = await request(routeConfig.url, routeConfig.method, params);
    let statusCode = result.statusCode;
    result = result.data;
    if (statusCode !== routeConfig.statusCode) {
      console.info((`test statusCode fail:  ${routeConfig.url} + ${key}`).red);
      return false;
    }
  }

  if (!routeConfig.paginationQueryConfig)
    routeConfig.paginationQueryConfig = {
      startIndex: 1,
      listKey: 'data.list'
    };
  routeConfig = MOCK_LIB.parseRouteConfig(routeConfig);
  let sourceData = MOCK_LIB.getResponseData(routeConfig, { query: params, body: params });
  if (sourceData != null && JSON.stringify(sourceData) !== result) {
    console.info((`test data fail:  ${routeConfig.url} + ${key}`).red);

    console.info(result, sourceData);
    return false;
  }
  console.info((`test success:  ${routeConfig.url} + ${key}`).green);
  return true;
};

let testInitCommand = function () {
  let removefs = (_path) => {
    try {
      let stats = fs.statSync(_path);
      if (stats.isDirectory()) {
        let objs = fs.readdirSync(_path);
        objs.forEach(obj => {
          removefs(path.resolve(_path, obj));
        });
        fs.rmdirSync(_path);
      } else {
        fs.unlinkSync(_path);
      }
    } catch (ex) {
      throw ex;
    }
  };
  try {
    removefs(path.resolve(__dirname, 'mock-data'));
  } catch (ex) {
    console.info('test init command removefs fail'.red);
    return;
  }
  try {
    mock.init();
  } catch (ex) {
    console.info('test init command fail'.red);
    throw ex;
  }

  console.info('test init command success.'.green);
};

let testServerRun = function () {
  server.start().then(() => {
    let mockConfig = require('./mock-data/config');
    let keys = Object.keys(mockConfig.routes);
    let completeCount = 0;
    keys.forEach(async (key, i) => {
      let routeConfig = MOCK_LIB.parseRouteConfig(mockConfig.routes[key]);
      await testApi(key, routeConfig);
      completeCount++;
      if (completeCount === keys.length) {
        console.info('test finally! exit');
        process.exit(0);
      }
    });
  });
};

testInitCommand();
testServerRun();
