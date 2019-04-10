# feature

1. 修改配置文件时，可以自动监听并重启服务
2. <s>根据配置文件自动生成模拟数据（取消实现）</s>

# 2.0.6

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


2. **update:** 配置调整：

   * **callbackStatus**调整为**statusCode**
   * **paginationQueryConfig.pageIndex**调整为**paginationQueryConfig.pageIndexKey**
   * **paginationQueryConfig.pageIndex**调整为**paginationQueryConfig.pageSizeKey**
   * **paginationQueryConfig.pageIndex**调整为**paginationQueryConfig.listKey**
   
3. **remove:** **ext**不再提供**getPageData**方法

4. **add:** 扩充引用**fe-mock-data**时的提供的方法

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

   		// routeConfig：config文件中的某一项配置；req 需要一个{ body?:{}, query?:{} }类似的结构，可以用来模拟传递的请求参数  		mock.getResponseData(routeConfig, req /* express request */);

   ```

5. **add:** 添加单元测试，进入**test**目录，执行**node test.js**

6. **update:** 命令行提示信息优化
