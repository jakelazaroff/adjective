'use strict';

// system
const path = require('path');

// libraries
const chokidar = require('chokidar'),
      httpServer = require('http-server'),
      Pool = require('cloth').Pool,
      readdirp = require('readdirp'),
      rimraf = require('rimraf'),
      through = require('through');

// modules
const constants = require('./constants'),
      dependencies = require('./dependencies');

const benchmark = start => {
  const ms = new Date() - start;
  return ms < 1000 ? `${ms}ms` : `${ms / 1000}s`;
}

const clean = callback => {
  const start = new Date();
  rimraf(constants.BUILD_PATH, () => {
    console.log(`Cleaned in ${benchmark(start)}`);
    callback();
  });
};

const fileBlacklist = [
  '.DS_Store'
];

const shouldProcess = fullPath => (
  fileBlacklist.indexOf(path.basename(fullPath)) === -1 &&
  !fullPath.split('/').some(name => name[0] === '_')
);

const pool = new Pool(`${__dirname}/worker`, {
  arguments: flags
});

const build = callback => {
  callback = callback || function () {};

  const _callback = () => {
          console.log(`Built in ${benchmark(start)}`);
          callback();
        },
        start = new Date();

  let remaining = 0;
  readdirp({
    root: constants.SOURCE_PATH,
    fileFilter: file => shouldProcess(file.fullPath)
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

clean(() => {
  build(() => {

    if (command === 'build') {
      process.exit(0);
    } else if (command === 'serve') {

      const port = 8080;
      httpServer.createServer({
        root: constants.BUILD_PATH
      }).listen(port, '0.0.0.0');
      console.log(`Serving at http://localhost:${port}`);

      chokidar.watch(constants.SOURCE_PATH, {
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

          if (shouldProcess(path)) {
            remaining += 1;
            pool
              .run(path)
              .on('end', () => done(path))
              .on('error', console.log);
          }

          dependencies.get(path).forEach(file => {
            remaining += 1;
            pool
              .run(file)
              .on('end', () => done(file))
              .on('error', console.log);
          });
        });
    }
  });
});
