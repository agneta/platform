const path = require('path');

module.exports = function(watcher) {

  var project = watcher.project;
  var locals = watcher.locals;
  var reload = watcher.reload;

  return function(pathFile) {
    var params = path.parse(pathFile);

    switch (params.ext) {
      case '.yml':

        return locals.main.load.config()
          .then(function() {
            return locals.main.load.pages();
          })
          .then(function() {
            project.call_listeners('ready');
          })
          .delay(100)
          .then(function() {
            reload();
          })
          .catch(function(error) {
            console.error(error);
          });

    }

  };
};
