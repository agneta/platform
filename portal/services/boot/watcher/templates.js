const path = require('path');
const Promise = require('bluebird');
module.exports = function(watcher) {

  var locals = watcher.locals;
  var app = locals.services;

  return function(pathFile) {
    var params = path.parse(pathFile);
    return Promise.resolve()
      .then(function() {

        if (params.ext !='.yml') {
          return;
        }
        //console.log(pathFile);
        app.edit.clearCache({
          path: pathFile
        });

      });
  };
};
