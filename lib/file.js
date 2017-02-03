'use strict';

// system
const fs = require('fs'),
      path = require('path');

// libraries
const mkdirp = require('mkdirp');

module.exports = class File {

  constructor (filepath, contents) {
    this.path = filepath;
    this.name = path.basename(filepath);
    this.contents = contents;
    this.dependencies = [];
  }

  static read (filepath, callback) {
    fs.readFile(filepath, (err, contents) => {
      if (err) { return callback(err); }

      callback(null, new File(filepath, contents));
    });
  }

  write (callback) {
    mkdirp(path.dirname(this.path), () => {
      fs.writeFile(this.path, this.contents, callback);
    });
  }
}
