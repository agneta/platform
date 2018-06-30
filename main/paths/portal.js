const path = require('path');
const structure = require('./structure');

module.exports = function(options) {
  var main = structure({
    base: path.join(options.core.platform, 'portal')
  });

  var app = structure({
    base: path.join(options.core.project, 'portal')
  });

  return {
    main: main,
    app: app
  };
};
