'use strict';

module.exports = {

  benchmark: start => {
    const ms = new Date() - start;
    return ms < 1000 ? `${ms}ms` : `${ms / 1000}s`;
  }
};
