let http = require('http');
let config = require('./config');
let server = require('./lib/server');
const MOCK_LIB = require('./lib/main');
let colors = require('colors');

let request = function (url, method) {
  return new Promise(resolve => {
    if (method !== 'get' && method !== 'post') return resolve(1);
    let options = {
      hostname: 'localhost',
      port: config.port,
      path: url,
      agent: false,
      method: method.toUpperCase()
    };
    let req = http.request(options, (res) => {
      res.setEncoding('utf8');
      let data = '';
      res.on('data', (str) => {
        data += str;
      });
      res.on('end', () => {
        resolve({ data: data, statusCode: res.statusCode });
      });
    });
    req.on('error', (e) => {
      resolve({ data: e.message, statusCode: req.statusCode });
    });
    req.end();
  });
};

let testApi = async function (key, routeConfig) {
  let result = await request(routeConfig.url, routeConfig.method);
  let statusCode = result.statusCode;
  result = result.data;
  let sourceData = MOCK_LIB.getResponseData(routeConfig, { query: {}, body: {} });
  if (sourceData != null && JSON.stringify(sourceData) !== result) {
    console.info((`test data fail:  ${routeConfig.url} + ${key}`).red);
    return false;
  }
  if (statusCode !== routeConfig.callbackStatus) {
    console.info((`test statusCode fail:  ${routeConfig.url} + ${key}`).red);
    return false;
  }
  console.info((`test success:  ${routeConfig.url} + ${key}`).green);
  return true;
};

server.start().then(() => {
  let mockConfig = require('./mock-data/config');
  let keys = Object.keys(mockConfig.routes);
  let completeCount = 0;
  keys.forEach(async (key, i) => {
    let routeConfig = MOCK_LIB.parseRouteConfig(mockConfig.routes[key]);
    await testApi(key, routeConfig);
    completeCount ++;
    if (completeCount === keys.length) {
      console.info('test finally! exit');
      // process.exit(0);
    }
  });
});