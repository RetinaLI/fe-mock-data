#!/usr/bin/env node
let path = require('path');
let fs = require('fs');

module.exports.init = function () {

  let source_dir = path.resolve(__dirname, '../mock-data');
  let target_dir = path.resolve('.', 'mock-data');

  let copy = function (_source_path, _target_path) {
    let stats = fs.statSync(_source_path);
    try{
      fs.accessSync(_target_path, fs.constants.R_OK);
    } catch (err) {
      if (stats.isDirectory()) {
        fs.mkdirSync(_target_path);
      } else {
        data = fs.readFileSync(_source_path, 'utf8');
        fs.writeFileSync(_target_path, data, 'utf8');
      }
    } finally {
      if (stats.isDirectory()) {
        let objs = fs.readdirSync(_source_path);
        objs.forEach(obj => {
          copy(path.resolve(_source_path, obj), path.resolve(_target_path, obj), );
        });
      }
    }
  };


  try {
    copy(source_dir, target_dir);
  } catch(err) {
    throw err;
  }
};