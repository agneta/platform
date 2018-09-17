const path = require('path');
const fs = require('fs-extra');
const config = require('../config');
const structure = require('./structure');

module.exports = function(options) {
  var appConfig = options.config;

  var name = appConfig.frontend || 'angularjs';
  var dirPath = config.agneta.get('frontend');

  if (!dirPath) {
    dirPath = path.join(options.core.project, 'node_modules', `@agneta/${name}`);
  }

  if (!fs.pathExistsSync(dirPath)) {
    throw new Error(`Could not find frontend path: ${dirPath}`);
  }

  var data = {
    base: dirPath
  };
  return structure.frontend({
    data: data
  });
};
