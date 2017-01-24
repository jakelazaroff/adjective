'use strict';

const cwd = process.cwd(),
      path = `${cwd}/blah.config.js`;

module.exports = Object.assign({
  config: path,
  source: `${cwd}/src`,
  destination: `${cwd}/public`,
}, require(path));
