'use strict';

const cwd = process.cwd(),
      path = `${cwd}/config.js`;

let config;
try {
  config = require(path);
} catch (e) {
  config = {};
}

module.exports = Object.assign({
  config: path,
  source: `${cwd}/src`,
  destination: `${cwd}/public`,
  transforms: [],
}, config);
