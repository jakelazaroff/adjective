'use strict';

// system
const path = require('path');

// libraries
const chokidar = require('chokidar'),
      httpServer = require('http-server'),
      Pool = require('cloth/pool'),
      readdirp = require('readdirp'),
      rimraf = require('rimraf'),
      through = require('through');

// modules
const config = require('./config'),
      dependencies = require('./dependencies');

const benchmark = start => {
  const ms = new Date() - start;
  return ms < 1000 ? `${ms}ms` : `${ms / 1000}s`;
}

const clean = callback => {
  const start = new Date();
  rimraf(config.destination, () => {
    console.log(`Cleaned in ${benchmark(start)}`);
    callback();
  });
};

const pool = new Pool(`${__dirname}/worker`);

const build = callback => {
  callback = callback || function () {};

  const _callback = () => {
          console.log(`Built in ${benchmark(start)}`);
          callback();
        },
        start = new Date();

  let remaining = 0;
  readdirp({
    root: config.source,
    fileFilter: config.ignore instanceof RegExp ? info => !info.fullPath.match(config.ignore) : config.ignore
  })
  .on('end', () => {
    if (pool.available() < pool.total()) {
      pool.on('end', () => {
        if (!--remaining) {
          _callback();
        }
      });
    } else { _callback(); }
  })
  .pipe(through(function write(file) {
    remaining += 1;
    pool
      .run(file.fullPath)
      .on('dependencies', data => {
        dependencies.store(file.fullPath, data);
      })
      .on('error', console.log);
  }));
};

const serve = () => clean(() => {
  build(() => {

    const port = 8080;
    httpServer.createServer({
      root: config.destination
    }).listen(port, '0.0.0.0');
    console.log(`Serving at http://localhost:${port}`);

    chokidar.watch(config.source, {
        ignored: config.ignore,
        ignoreInitial: true,
        persistent: true
      })
      .on('change', path => {
        console.log(`${path} changed`);
        let remaining = 0;
        const start = new Date(),
              log = () => console.log(`Rebuilt in ${benchmark(start)}`),
              done = file => {
                console.log(`${file} rebuilt`)
                if (!--remaining) {
                  log();
                }
              };

        remaining += 1;
        pool
          .run(path)
          .on('end', () => done(path))
          .on('error', console.log);

        dependencies.get(path).forEach(file => {
          remaining += 1;
          pool
            .run(file)
            .on('end', () => done(file))
            .on('error', console.log);
        });
      });
  });
});

module.exports = {
  clean: clean,
  build: build,
  serve: serve
};
