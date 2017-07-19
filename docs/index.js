var documentation = require('documentation');

documentation.build(['index.js'])
  .then(documentation.formats.json)
  .then(function(output) {
    console.log(output);
  });
