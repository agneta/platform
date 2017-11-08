const path = require('path');
const _ = require('lodash');


module.exports = function(watcher) {

  var locals = watcher.locals;

  return function(pathFile) {
    var params = path.parse(pathFile);

    switch (params.ext) {
      case '.js':

        delete require.cache[require.resolve(pathFile)];
        var script = require(pathFile);

        if (_.isFunction(script)) {
          script(locals);
        }

        break;
    }

  };
};
