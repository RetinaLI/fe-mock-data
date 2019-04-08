#!/usr/bin/env node
let init = require('./bin/init.js');
let runMock = require('./bin/run');
let program = runMock.program;

program
  .command('init')
  .description('初始化mock-server文件夹')
  .action(function() {
    init.fun();
  })

program
  .command('run')
  .description('运行模拟后台数据')
  .action(function() {
    runMock.run();
  })

program.parse(process.argv);

