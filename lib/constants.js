'use strict';

// system
const path = require('path');

// directory names
const SOURCE_DIRNAME = 'src',
      BUILD_DIRNAME = 'build',

// project directories
      ROOT_PATH = path.join(__dirname, '..'),
      SOURCE_PATH = path.join(ROOT_PATH, SOURCE_DIRNAME),
      BUILD_PATH = path.join(ROOT_PATH, BUILD_DIRNAME);

module.exports = {
  SOURCE_DIRNAME,
  BUILD_DIRNAME,
  ROOT_PATH,
  SOURCE_PATH,
  BUILD_PATH
};
