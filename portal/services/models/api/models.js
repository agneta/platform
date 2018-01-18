const Promise = require('bluebird');
const _ = require('lodash');

module.exports = function(Model, app) {

  Model.models = function() {

    return Promise.resolve()
      .then(function() {

        return Promise.map(app.models(), function(model) {
          console.log(model);
          return {
            name: model.modelName,
            dataSource: model.dataSource.name
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
