const Promise = require('bluebird');

module.exports = function(Model, app) {

  Model.models = function() {

    var remotes = app.remotes();

    return Promise.resolve()
      .then(function() {

        return Promise.map(remotes.classes(), function(remoteClass) {
          return {
            name: remoteClass.name,
            http: remoteClass.http
          };
        });

      })
      .then(function(list){
        return {
          list: list
        };
      });

  };

  Model.remoteMethod(
    'models', {
      description: 'Get API models',
      accepts: [],
      returns: {
        arg: 'result',
        type: 'object',
        root: true
      },
      http: {
        verb: 'get',
        path: '/models'
      },
    }
  );

};
