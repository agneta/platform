var pathFn = require('path');

module.exports = function(locals) {
  locals.page.parseFilename = function(path) {
    path = path.substring(0, path.length - pathFn.extname(path).length);
    path = pathFn.normalize(path);
    if (path[0] != '/') {
      path = '/' + path;
    }
    return path;
  };
};
