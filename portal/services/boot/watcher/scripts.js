const path = require('path');

module.exports = function(watcher) {

  var locals = watcher.locals;

  return function(pathFile) {
    var params = path.parse(pathFile);

    switch (params.ext) {
      case '.js':

        delete require.cache[require.resolve(pathFile)];
        require(pathFile)(locals);

        break;
    }

  };
};
