'use strict';

const cwd = process.cwd(),
      path = `${cwd}/config.js`;

const safeRequire = path => {
  try {
    return require(path);
  } catch (e) {}
}

module.exports = Object.assign({

  // path to config file
  config: path,

  // source directory
  source: `${cwd}/src`,

  // destination directory
  destination: `${cwd}/public`,

  // files ignored by watcher and workers
  ignore: /(^|[\/\\])\../,

  // transforms applied to each file
  transforms: []

}, safeRequire(path) || {});
