const path = require('path');
const structure = require('./structure');
const fs = require('fs-extra');
const config = require('../config');

module.exports = function(options) {
  var mainPath =
    config.agneta.get('portal') ||
    path.join(options.core.project, 'node_modules', 'agneta-portal');

  if (!fs.pathExistsSync(mainPath)) {
    throw new Error(`Could not find portal path: ${mainPath}`);
  }

  var app = structure.init({
    base: path.join(options.core.project, 'portal')
  });
  var main = structure.init({
    base: mainPath
  });

  return {
    main: main,
    app: app
  };
};
