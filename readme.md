# 轻量级 后台数据模拟（fe-mock-data)
  [github地址](https://github.com/RetinaLI/fe-mock-data)
## 特点
  + 轻量级，开发配置都很简单，提供初始化模版生成，只需要安装node和npm，不需要额外的比如mongodb、redis等等
  + 数据主要基于json文件，也可以自定义返回
  + 支持websocket，暂不支持restful接口
  + 灵活，提供所有配置项，也可以自定义
  + 模拟真实的数据请求流程，方便在开发过程中检查请求参数和请求头等信息是否正确

## 使用场景
  + 后端接口短时间不能开发完成，前端需要模拟数据，方便开发、调试
  + 在需要测试特定数据下的系统运行情况，且后端不方便提供模拟场景时，可以简单搭建一个数据环境

## 快速开始

   在开始之前，假设你已经安装了node(v8.x及以上)。

### 全局安装npm包
  	npm i fe-mock-data -g

### 使用命令行生成模版
  	fe-mock-data init

   * 会生成`mock-data`文件夹，里面包含一个`json`文件夹和一个`config.js`文件，仅供参考。
   * **注意：**`mock-data`文件夹、`json`文件夹、`config.js`均可以放置任意路径，只需要修改启动参数和配置路径即可。
   * 如果已经有mock-data文件夹，程序会自动比对，不会覆盖现有文件

### 启动

   	fe-mock-data run

   * 命令行提示 `mock server is ok!` 即为成功

### 完整启动

	fe-mock-data run --path  mock-data/config.js --port 4200  [--watch]

* `path`：路由配置文件，默认 mock-data/config.js
* `port`：端口，默认 4200
* `watch`：监听config修改并热启动，默认不启动

## 配置文件 config.js 的语法
   [进入](https://github.com/RetinaLI/fe-mock-data/blob/master/mock-data/config.js)

## 注意事项： 配置文件 config.js,在webpack + babel(vue/react/angular)项目中，其他模块引用方式
  1. 如果使用`export default {}`方式导出模块，引入方式;
    ```
    import xxx from '../mock-data/config.js';
    ```

  2. 如果使用`module.exports`方式导出模块，引用方式[可能会报错：export与module.exports不能混用];
    ```
      import xxx from '../mock-data/config.js';
    ```
    + 防止报错方法：比如修改`.babelrc`文件：

     ```
     plugins: [
      ...,
      "transform-runtime",
      "transform-es2015-modules-commonjs"
     ]
     ```
     两个配置项必须同时出现或者同时不出现。
  3. **特别注意：** 当使用websocket的renderFn进行自定义时，必须加上判断：ws.readyState === 1，如果有定时任务，也需要注意清除定时任务，比如：

    ```
      let intervalId = null;

      // websocket，自定义返回
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
          }, 4000);
        }
      }

    ```

## 更多命令
    fe-mock-data -h
    fe-mock-data -V
