'use strict';

// system
const path = require('path');

// libraries
const chokidar = require('chokidar'),
      Pool = require('cloth').Pool;

// modules
const createTransform = require('./createTransform');

module.exports = {
  createTransform: createTransform,

  watch: config => {
    const pool = new Pool(`${__dirname}/worker`, { arguments: [config.config] });
    const watcher = chokidar.watch(config.source, {
      persistent: false
    }).on('add', event => {
      pool.run(event);
    });
  }
};
