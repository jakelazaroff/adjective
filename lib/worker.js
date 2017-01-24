'use strict';

// system
const fs = require('fs'),
      path = require('path');

// libraries
const async = require('async'),
      worker = require('cloth').worker;

// modules
const File = require('./file'),
      config = require(`${__dirname}/config`);

worker.run((filepath, callback) => {

  async.waterfall([

    // read file from source
    next => File.read(filepath, next),

    // apply transforms
    (file, next) => async.reduce(
      config.transforms,
      file,
      (memo, transform, callback) => {
        try {
          transform(memo, callback);
        } catch (err) {
          next(err);
        }
      },
      next
    ),

    // change file paths to destination
    (file, next) => {
      file.path = file.path.replace(config.source, config.destination);
      next(null, file);
    },

    // write file to destination
    (file, next) => file.write(next)

  ], callback);
});
