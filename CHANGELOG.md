# feature

暂无

# 2.0.12

1. **add**: 支持热启动：监听配置文件的修改并自动重新启动。启动命令参数：--watch，默认不启动

  ```
     fe-mock-data run --watch
  ```

  **注意：** 当使用`require('fe-mock-data').start({app: app})` 方式启动时，不会启动热启动。

# 2.0.10

1. fix mock-data/config.js 一个示例bug

# 2.0.9

1. **add:** 可以与webpack的webpack-dev-server插件集成，集成方式：

  ```
      const mock = require('fe-mock-data');

      ...

      devServer: {
            ...,

         // 由于webpack-dev-server 本身就是express服务器，可以直接使用
         before(app) {
               mock.start({
                  app: app,
                  port: 4200,
                  path: 'mock-data/config.js'
               });
         }
       }
  ```

2. **add:** 扩充引用**fe-mock-data**时的提供的方法

   ```
   const mock = require('fe-mock-data');

   // 分页获取数据方法
   mock.getPageData(arr, pageIndex, pageSize, startPageIndex)

   // 可以自定义启动服务，可以使用该方法和webpack-dev-server集成
   mock.start({
      app: app,  // express app
      port: 4200,
      path: 'mock-data/config.js'
   });

   //config文件中的某一项配置，会验证合法性、补足默认项
   mock.parseRouteConfig(routeConfig);

   // routeConfig：config文件中的某一项配置；
   // req 需要一个{ body?:{}, query?:{} }类似的结构，可以用来模拟传递的请求参数
   mock.getResponseData(routeConfig, req /* express request */);

   ```

3. **add:** 添加单元测试，进入**test**目录，执行**node test.js**

4. **update:** 命令行提示信息优化，提升健壮性

4. **update:** 规范了websocket自定义的写法，并添加到示例中

   ```
      let intervalId = null;
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
   ```

## BREAKING CHANGES

1. **update:** 配置调整：

   * **callbackStatus**调整为**statusCode**
   * **paginationQueryConfig.pageIndex**调整为**paginationQueryConfig.pageIndexKey**
   * **paginationQueryConfig.pageSize**调整为**paginationQueryConfig.pageSizeKey**
   * **paginationQueryConfig.listName**调整为**paginationQueryConfig.listKey**

2. **remove:** **ext**不再提供**getPageData**方法，使用如下方式替换：
   ```
      renderFn: (data, req, res, ext) {
        const MOCK_LIB = require('fe-mock-data');
        data.list = MOCK_LIB.getPageData(data.list, req.body.pageIndex, req.body.pageSize, 1);
        res.status(200).send(dataRes);
      }
   ```