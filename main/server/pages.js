var projectPaths = require('../paths').core;
var start = require('../start');

module.exports = function(options) {

  options = options || {};

  var webPages = start.website({
    root: '',
    worker: options.worker,
    dir: projectPaths.project,
    server: options.server,
    app: options.app
  });

  var services = start.services({
    worker: options.worker,
    dir: projectPaths.project,
    server: options.server,
  });

  webPages.locals.services = services.locals.app;
  services.locals.client = webPages.locals;

  return start.init([
    services,
    webPages
  ])
    .then(function() {
      return {};
    });

};
