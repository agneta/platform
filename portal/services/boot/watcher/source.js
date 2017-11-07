const path = require('path');

module.exports = function(watcher) {

  var locals = watcher.locals;
  var reload = watcher.reload;

  return function(pathFile) {
    var params = path.parse(pathFile);

    switch (params.ext) {

      case '.yml':
        return locals.main.load.pages();
      case '.styl':
        reload();
        break;
      case '.js':
        reload();
        break;
      case '.ejs':
        locals.cache.templates.invalidate(pathFile);
        reload();
        break;
    }

  };
};
