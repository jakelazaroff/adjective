'use strict';

// system
const fs = require('fs'),
      path = require('path');

// libraries
const async = require('async'),
      worker = require('cloth/worker');

// modules
const File = require('./file'),
      config = require(`${__dirname}/config`);

const NO_FILE_RETURNED = 'NO_FILE_RETURNED';

worker.run((filepath, callback) => {

  async.waterfall([

    // read file from source
    next => File.read(filepath, next),

    // apply transforms
    (file, next) => async.reduce(
      config.transforms,
      file,
      (memo, transform, callback) => {
        transform(memo, (err, file) => {
          if (!file) { return callback(NO_FILE_RETURNED); }

          callback(err, file);
        });
      },
      next
    ),

    // send file dependencies to main thread
    (file, next) => {
      worker.send('dependencies', file.dependencies);
      next(null, file);
    },

    // change file paths to destination
    (file, next) => {
      file.path = file.path.replace(config.source, config.destination);
      next(null, file);
    },

    // write file to destination
    (file, next) => file.write(next)

  ], (err, file) => {
    if (err === NO_FILE_RETURNED) { return callback(null, file); }

    callback(err, file);
  });
});
