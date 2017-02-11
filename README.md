# blah

A work-in-progress static site generator

## Installation

```
npm install blah --save-dev
```

## Usage

```
blah build
```

## API

**config.js**

```javascript
module.exports = {
  source: 'src', // folder from which files will be read
  destination: 'build', // folder to which files will be written
  ignore: /.*/, // regex or function applied to each file's path to determine if it's run through blah. Matched files aren't watched; a transform should be used to filter out any source files that shouldn't be written to the destination
  transforms: [ // array of transformations to be applied to each file
    require('blah-filter')()
  ]
};
```

**transform**

```javascript
const transform = require('blah/transform');

module.exports = transform(
  '.js',
  (file, callback) => {
    // ...
  }
);
```
