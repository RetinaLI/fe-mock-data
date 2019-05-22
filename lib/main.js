// 获取分页数据
function getPageData (json = null, pageIndex = 0, pageSize = 20, keyName = 'data', startPage = 0) {
  let result = getDataFromJsonFile(json);
  if (result) {
    let resJson = result;
    let list = resJson;
    let arr = keyName.split('.');
    let temp;

    arr.forEach((k, i) => {
      list = list[k];

      if (i === arr.length - 2) {
        temp = list;
      }
    });

    temp[arr[arr.length - 1]] = model.getPageData(list, pageIndex, pageSize, startPage);
    return resJson;
  }
}

let getRequestParams = function (req, method) {
  return method === 'get' ? req.query : req.body;
};

// 获取json全部数据，不分页
function getDataFromJsonFile (json) {
  let fs = require('fs');
  let path = require('path');
  if (typeof json === 'string') {
    return JSON.parse(fs.readFileSync(path.join(path.resolve('.'), json)));
  } else if ( typeof json === 'object') {
    return json
  }

}

// 返回数据公共代码提取
function getCommResult (routeConfig, req) {
  let config = routeConfig.paginationQueryConfig;
  let pIndex, pSize, pList, startIndex, dataRes;

  pIndex = config.pageIndexKey;
  pSize = config.pageSizeKey;
  pList = config.listKey;
  startIndex = config.startIndex;
  let nPageIndex = 0;
  let nPageSize = 20;
  let params = getRequestParams(req, routeConfig.method);

  nPageIndex = parseInt(params[pIndex]);
  nPageSize = parseInt(params[pSize]);

  if (!isNaN(nPageIndex) && !isNaN(nPageSize)) {
    dataRes = getPageData(routeConfig.json, nPageIndex, nPageSize, pList, startIndex);
  } else {
    dataRes = getDataFromJsonFile(routeConfig.json);
  }
  return dataRes;
}
// 返回dataRes
function getResponseData (routeConfig, req) {
  if (!routeConfig.json) return null;
  if (!routeConfig.paginationQueryConfig) {
    return getDataFromJsonFile(routeConfig.json);
  }
  return getCommResult(routeConfig, req);
}
const model = {
  getResponseData,
  parseRouteConfig (routeConfig) {
    routeConfig.method = ((routeConfig.method || 'get') + '').toLowerCase();
    if (routeConfig.method !== 'get' && routeConfig.method !== 'post' && routeConfig.method !== 'ws') { throw Error('配置请求方式错误，必须为get/post/ws其中一种') };

    routeConfig.url = routeConfig.url || '/';

    routeConfig.statusCode = routeConfig.statusCode || 200;
    if (isNaN(parseInt(routeConfig.statusCode))) { throw Error('状态码必须为数字') };

    if (routeConfig.method === 'ws') {
      routeConfig.interval = routeConfig.interval || 5000;
      if (!routeConfig.renderFn && isNaN(parseInt(routeConfig.interval))) { throw Error('轮训时间必须为数字，单位ms') };
    }
    if (routeConfig.paginationQueryConfig) {
      routeConfig.paginationQueryConfig.pageIndexKey = routeConfig.paginationQueryConfig.pageIndexKey || 'pageIndex';
      routeConfig.paginationQueryConfig.pageSizeKey = routeConfig.paginationQueryConfig.pageSizeKey || 'pageSize';
      routeConfig.paginationQueryConfig.startIndex = routeConfig.paginationQueryConfig.startIndex == null ? 0 :  routeConfig.paginationQueryConfig.startIndex;
      routeConfig.paginationQueryConfig.listKey = routeConfig.paginationQueryConfig.listKey || 'list';
    }
    // console.info(routeConfig.paginationQueryConfig.pageIndexKey);
    return routeConfig;
  },
  getPageData: function (arrayData, pageIndex, pageSize, startPage) {
    pageIndex = +pageIndex;
    pageSize = +pageSize;
    let pageData = [];
    if (arrayData && arrayData.length > 0) {
      if (startPage === 0) {
        pageData = arrayData.slice(pageSize * pageIndex, (pageIndex + 1) * pageSize);
      } else {
        pageData = arrayData.slice(pageSize * (pageIndex - 1), pageIndex * pageSize);
      }
      return pageData;
    }
  },
  start (opt) {
    if (!opt.app) throw 'need an app instance of express'
    let server = require('./server');
    server.start(opt);
  }
};

module.exports = model;