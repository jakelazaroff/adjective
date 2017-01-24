'use strict';

const fileToDependencies = {},
      dependencyToFiles = {};

const store = (filename, dependencies) => {
  fileToDependencies[filename] = fileToDependencies[filename] || [];

  const toRemove = fileToDependencies[filename].filter(
            file => dependencies.indexOf(file) === -1
          ),
        toAdd = dependencies.filter(
            dependency => fileToDependencies[filename].indexOf(dependency) === -1
          );

  toRemove.forEach(dependency => {
    const files = dependencyToFiles[dependency],
          index = files.indexOf(filename);

    dependencyToFiles[dependency] = files.slice(0, index).concat(files.slice(index + 1));
  });

  toAdd.forEach(dependency => {
    dependencyToFiles[dependency] = dependencyToFiles[dependency] || [];
    dependencyToFiles[dependency].push(filename);
  });

  fileToDependencies[filename] = dependencies;
};

const get = filename => dependencyToFiles[filename] || [];

module.exports = {
  store: store,
  get: get
};
