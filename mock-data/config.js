module.exports = {
    publicPath: 'mock-data/public',
    routes: {
      getHelloData: {
        url: '/hello',
        method: 'get',
        json: 'mock-data/json/hello.json',
        paginationQueryConfig: {
          pageIndex: 'index',
          pageSize: 'size',
          startIndex: 1,
          listName: 'result.list'
        },
        callbackStatus: 200
      },
      getHiData: {
        url: '/hi',
        method: 'post',
        callbackStatus: 200,
        json: 'mock-data/json/aaa.json'
        // renderFn: function (dataRes, req, res, ext) {
        //   res.status(200).sendFile(ext.path.join(ext.path.resolve(''), 'mock-data/json/identify.png'));
        // }
      }
    }

  }