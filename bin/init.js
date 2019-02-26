#!/usr/bin/env node
let path = require('path');
let fs = require('fs');

module.exports.fun = function () {
  let basePath = path.resolve('.');

  function makep (dir) {
    let paths = dir.split('/')
    let index = 1;
    function createDir (index, fn) {
      if (index > paths.length) {
        return fn && fn()
      }
      let newPath = paths.slice(0, index).join('/')

      fs.access(newPath, err => {
        if (err) {
          fs.mkdir(newPath, err => {
            if (err) throw new Error(err)
            createDir(index + 1)
          })
        } else {
          createDir(index + 1)
        }
      })
    }
    createDir(index)
  }

  makep('mock-data/json');

  let data1 = {
    "info": "success",
    "data": [
      {
        "id": 1,
        "name": "hello"
      },
      {
        "id": 2,
        "name": "hi"
      },
      {
        "id": 3,
        "name": "morning"
      },
      {
        "id": 4,
        "name": "how are you"
      }
    ]
  };

  let data2 = {
    "result": {
      "success": true,
      "list": [
        {
          "id": 1,
          "name": "name1"
        },
        {
          "id": 2,
          "name": "name2"
        },
        {
          "id": 3,
          "name": "name3"
        },
        {
          "id": 4,
          "name": "name4"
        }
      ]
    }
  }
  let data3 = `module.exports = {
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
        method: 'get',
        callbackStatus: 200,
        json: 'mock-data/json/aaa.json'
        // renderFn: function (req, res, ext) {
        //   res.status(200).sendFile(ext.path.join(ext.path.resolve(''), 'mock-data/json/identify.png'));
        // }
      }
    }
  }`

  let str1 = JSON.stringify(data1, null, '\t');
  let str2 = JSON.stringify(data2, null, '\t');

  fs.access('mock-data', function() {
    start();
  })
  async function start() {
    await writeData1();
    await writeData2();
    await writeData3();
    console.log('文件初始配置成功');
  }

  function writeData1 () {
    return new Promise((resolve, reject) => {
      fs.writeFile(basePath + '/mock-data/config.js', data3, (err, data) => {
          if (err) {
              reject(err);
          }
          resolve()
      });
    })
  };
  function writeData2 () {
    return new Promise((resolve, reject) => {
      fs.writeFile(basePath + '/mock-data/json/aaa.json', str1, (err, data) => {
          if (err) {
              reject(err);
          }
          resolve()
      });
    })
  };
  function writeData3 () {
    return new Promise((resolve, reject) => {
      fs.writeFile(basePath + '/mock-data/json/hello.json', str2, (err, data) => {
          if (err) {
              reject(err);
          }
          resolve()
      });
    })
  };


}