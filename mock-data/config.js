let intervalId = null;

export default {
  // publicPath + publicName 配置静态目录，参考express.static
  // app.use(publicName, express.static(publicPath));
  publicPath: 'mock-data/public',
  publicName: 'static',

  // 路由配置
  routes: {
    // 获取单个数据
    getSingleData: {
      url: '/data', // 默认 /
      method: 'get', // 默认 get
      statusCode: 200, // 默认 200
      json: {
        "data": {
          "name": "jakson"
        }
      }
    },
    // 返回404状态码
    getSingleDataWith404: {
      url: '/data/404',
      statusCode: 404,
      json: 'mock-data/json/data.json'
    },
    // 获取分页数据
    getList: {
      url: '/data/list',
      method: 'post',
      json: 'mock-data/json/list.json',
      paginationQueryConfig: {
        pageIndexKey: 'index', // 默认 pageIndex
        pageSizeKey: 'size', // 默认 pageSize
        startIndex: 1,  // 默认 0
        listKey: 'data.list' // 根据该配置路径查找具体的列表数据数组， 默认 list
      }
    },
    // 通过renderFn，自定义返回结果
    getListByRenderFn: {
      url: '/data/list-by-render',
      method: 'post',
      json: 'mock-data/json/list.json',
      renderFn: function (dataRes, req, res, ext) {
        /**
         * MOCK_LIB.getPageData: function (list: any[], pageIndex: number, pageSize: number, startIndex: number) return list: any[];
         */
        const MOCK_LIB = require('fe-mock-data');
        dataRes.data.list = MOCK_LIB.getPageData(dataRes.data.list, req.body.pageIndex, req.body.pageSize, 1);
        res.status(200).send(dataRes);
      }
    },
    /**
     * 通过renderFn + ext，自定义返回结果
     * ext: {   // 开放一些nodejs api和环境变量
     *  path: require('path'),
     *  fs: require('fs'),
     *  __dirname: __dirname
     * }
     *  */
    getDataWithoutJson: {
      url: '/data/no-json',
      method: 'post',
      renderFn: function (dataRes, req, res, ext) {
        let content = ext.fs.readFileSync(ext.path.join(ext.path.resolve(''), 'mock-data/json/data.json'));
        res.status(200).send(JSON.parse(content));
      }
    },
    // 获取一个文件
    getFile: {
      url: '/file',
      method: 'get',
      renderFn: function (dataRes, req, res, ext) {
        res.status(200).sendFile(ext.path.join(ext.path.resolve(''), 'mock-data/json/identify.png'));
      }
    },
    // websocket， 会重复返回json里面的数据
    getWsData: {
      url: '/ws/data',
      method: 'ws',
      interval: 3000,  // 默认5000ms
      json: 'mock-data/json/data.json'
    },
    // websocket，自定义返回，
    // 注意：一旦提供了renderFn，那么插件不会启动后台轮询，需要自行启动，比如setInterval
    getWsDataByRenderFn: {
      url: '/ws/data/custom-render',
      method: 'ws',
      json: 'mock-data/json/data.json',
      renderFn: function(dataRes, ws, req, ext) {
        clearInterval(intervalId);
        intervalId = setInterval(() => {
          if (ws.readyState === 1) {
            ws.send(JSON.stringify(dataRes));
          } else {
            clearInterval(intervalId);
          }
        }, 3000);
      }
    }
  }
};