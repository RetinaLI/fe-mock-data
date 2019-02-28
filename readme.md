## 后台数据模拟（fe-mock-data)
### 介绍
    fe-mock-data 是快速生成后台模拟数据的npm命令行工具
### 使用场景
  + 前后台同时开发或前台先开发，后台数据尚未开发完成，因此前台需要模拟数据
  + 模拟后台服务，造假数据

### 快速开始
    在开始之前，假设你已经安装了 Node.js(v8.x及以上)。
### 安装
  + 全局安装 npm i fe-mock-data -g
### 特点
  + 简洁、高效
  + 兼容websocket
#### 初始化
    fe-mock-data init
    默认在根目录（package.json同级）生成mock-data文件夹，里面有json文件夹和config.js文件。
    其中json文件和config.js均可以放置任意路径。
    init命令生成文件仅仅作为参考。
#### 配置文件
    config.js通用配置写法如下：

```
    module.exports = {
      routes: {
        getHiData: {  //返回json数据
          url: '/hi',    //模拟路由
          method: 'get',  //get方式请求
          json: 'mock-data/json/aaa.json' // 模拟的数据文件路径，json格式的数据
        }
      }
    }
```
### 启动

    运行命令 fe-mock-data run
    完整写法为：fe-mock-data run --path  mock-data/config.js --port 4200
    path参数为配置文件路径，按项目实际情况配置。
    port参数为运行端口号，按项目实际情况配置。

### 更多配置

    如果有分页及不同状态模拟需求，则可以参照一下配置
```
    module.exports = {
      routes: {
        getHiData: {
          url: '/hi',
          method: 'get',
          callbackStatus: 404, // 模拟返回状态码404或者200，Number类型，默认返回200
          json: 'mock-data/json/aaa.json',
          paginationQueryConfig: {  // 如果要获取分页数据，则需要进行此项配置
            pageIndex: 'index', //查询页码数名字
            pageSize: 'size', //查询每页数据条数的名字
            startIndex: 1,  //页面开始页设置，通常设置为0或1
            listName: 'list' //返回数据具体字段名，如为更深层次则写为'list.res'格式
          }
        }
      }
    }
```

    如果有定制需求，则可参考以下设置
```
    module.exports = {
      publicPath: 'mock-data/public',  //静态文件路径（有需要可对此项进行设置）
      routes： {
        getHiData1: { //如仅需要返回一张图片，不需要返回json数据,省略json配置项
          url: '/hi',
          method: 'get',
          renderFn: function (null, req, res, ext) {  //该项配置表示，用户自定义的返回结果
            res.status(200).sendFile(ext.path.join(ext.path.resolve(''),'mock-data/json/identify.png'));
          }
        },
        getHiData2: { //需要用到json配置项返回的数据，进行自定义配置
          url: '/hi2',
          method: 'get',
          json: 'mock-data/json/aaa.json',
          renderFn: function (dataRes, req, res, ext) {  //该项配置表示，用户自定义的返回结果
            //ext.getPageData([1,22,3333,444], 1, 2, 1);
          }
        }
      }
    }
```

  如需用到websocket,参考一下配置
```
  getWsData: {
    url: 'ws://{{prefix}}/ws/hi', //配置websocket路径，只需更改'{{prefix}}'后面路径。前台写法是： 'ws://localhost:4200/ws/hi'.
    method: 'ws',  // 此项表示是websocket模拟，必填
    interval: 3000,  // 后台返回数据间隔（毫秒值），如不配置值返回一次
    json: 'mock-data/json/aaa.json'
    // renderFn: function(dataRes, ws, req, ext) { // 自定义项
    //   console.log(dataRes);
    // }
  }
```


注解：
  + publicPath 表示静态文件路径，调用时可用localhost:4200/public/xx.png写法；
  + 非websocket配置中的renderFn方法，当配置了json项，则第一个参数为dataRes,返回json数据，如果没有json配置项，则第一个参数为null; req、res为express的req、res;ext上面有path、fs、__dirname三个nodejs方法，getPageData基础分页方法。参数为(arr, pageIndex, pageSize, startIndex);
  + websocket配置中的renderFn方法，当配置了json项，则第一个参数为dataRes,返回json数据，如果没有json配置项，则第一个参数为null; ws、req为express的ws、req;ext同上。

#### 注意事项
  - 1、由于在config.js中使用了es6的module.exports 写法，因此在引入时最好使用 import * as xxx from '../mock-data/config.js';类似写法。
  - 2、在vue+webpack项目中（vue2.*版本），在打包过程中，如果没有使用1中所述方式，可能会报错。则需要注意.babelrc中的plugins设置，"transform-runtime" 和 "transform-es2015-modules-commonjs"要同时使用，或者两者都不用。

### 更多命令
    fe-mock-data -h
    fe-mock-data -V
