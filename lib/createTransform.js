'use strict';

// system
const path = require('path');

module.exports = (extension, hook) => {
  if (!hook) {
    hook = extension;
    extension = undefined;
  }

  return (file, callback) => {
    if (!extension || path.extname(file.name) === extension) {
      hook.length === 1 ? callback(null, hook(file)) : hook(file, callback);
    } else {
      callback(null, file);
    }
  };
};
