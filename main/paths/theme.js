const path = require('path');
const fs = require('fs-extra');
const config = require('../config');
const structure = require('./structure');

module.exports = function(options) {
  var appConfig = options.config;

  var themeName = appConfig.theme;
  var themePath;

  if (themeName) {
    themePath = path.join(options.core.project, 'node_modules', themeName);
  } else {
    themePath = config.agneta.get('theme');
  }
  if (!themePath) {
    throw new Error('No theme was configured. Please select a theme.');
  }

  if (!fs.pathExistsSync(themePath)) {
    throw new Error(`Could not find theme path: ${themePath}`);
  }

  return structure({
    base: themePath
  });
};
