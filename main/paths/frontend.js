const path = require('path');
const fs = require('fs-extra');
const config = require('../config');
const structure = require('./structure');

module.exports = function(options) {
  var appConfig = options.config;

  var name = appConfig.frontend;
  var dirPath;

  if (name) {
    dirPath = path.join(
      options.core.project,
      'node_modules',
      `frontend-${name}`
    );
  } else {
    dirPath = config.agneta.get('frontend');
  }
  if (!dirPath) {
    throw new Error('No frontend was configured. Please select a frontend.');
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
