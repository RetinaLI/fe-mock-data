#!/usr/bin/env node
if (process.argv.length > 1) {
  let config = require('./config');
  let program = require('commander');
  let packageInfo = require('./package.json');

  program
  .version(packageInfo.version)
  .option('-p, --path [path]', '配置文件路径', config.config)
  .option('-P, --port [port]', '配置端口号', config.port);
  .option('-W, --watch', '监听config修改并热启动，默认不启动');

  program
    .command('init')
    .description('初始化mock-server文件夹')
    .action(function() {
      let mock = require('./bin/mock.js');
      mock.init();
    });

  program
    .command('run')
    .description('运行模拟后台数据')
    .action(function() {
      let server = require('./lib/server');
      server.start({
        port: program.port || config.port,
        path: program.path || config.config,
        enableWatch: program.watch,
        app: null
      });
    });

  program.parse(process.argv);
}
module.exports = require('./lib/main');
