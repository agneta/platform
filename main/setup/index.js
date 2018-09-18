const fs = require('fs-extra');
const path = require('path');
const _ = require('lodash');
_.mixin(require('lodash-deep'));
require('source-map-support').install();

var pathMain = path.join(__dirname, '..');
global.requireMain = function(pathModule) {
  console.log(pathMain, pathModule);
  return require(path.join(pathMain, pathModule));
};

module.exports = function() {
  Promise.resolve()
    .then(function() {
      var secret = process.env.AGNETA_SECRET_KEY;
      return fs.outputJson(path.join(process.cwd(), '../secret.json'), secret);
    })
    .then(function() {
      return require('./ssh')();
    })
    .then(function() {
      return require('./git')();
    })
    .then(function() {
      return require('./generate')();
    })
    .then(function() {
      console.log('Agneta setup completed');
      process.exit();
    })
    .catch(function(err) {
      console.error(err);
      process.exit(2);
    });
};
