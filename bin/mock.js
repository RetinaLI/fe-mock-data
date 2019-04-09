#!/usr/bin/env node
let path = require('path');
let fs = require('fs');

module.exports.init = function () {

  let basePath = path.resolve('.');

  function makep (dir) {
    let paths = dir.split('/');
    let index = 1;
    function createDir (index) {
      if (index > paths.length) { return };
      let newPath = paths.slice(0, index).join('/');
      try {
        fs.accessSync(newPath);
        createDir(index + 1);
      } catch (err) {
        try {
            fs.mkdirSync(newPath);
            createDir(index + 1)
        } catch (e) {
            throw e;
        }
      }
    }
    createDir(index);
  };
   // nodeV8.5以上新增fs.copyFile 本项目暂未使用
  function copy(src, dest) {
    let data;
    try{
      data = fs.readFileSync(src, 'utf8');
    }catch(err){
      throw err;
    }

    try{
      fs.writeFileSync(dest, data, 'utf8');
    }catch(err){
      throw err;
    }
  };
  function writeData () {
    let urlA, urlHello, urlConfig;
    urlA = path.join(basePath, '/mock-data/json/aaa.json');
    urlHello = path.join(basePath, '/mock-data/json/hello.json');
    urlConfig = path.join(basePath, '/mock-data/config.js');

    copy('./mock-demo/json/aaa.json', urlA);
    copy('./mock-demo/json/hello.json', urlHello);
    copy('./mock-demo/config.js', urlConfig);
  };

  function start() {
    makep('mock-data/json');
    fs.accessSync('mock-data/json');
    writeData();
    console.log('文件初始配置成功');
  }

  try {
    start();
  } catch(err) {
    throw err;
  }
};