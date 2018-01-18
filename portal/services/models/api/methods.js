const Promise = require('bluebird');

module.exports = function(Model, app) {

  Model.methods = function(modelName) {

    return Promise.resolve()
      .then(function(){

        var model = app.models[modelName];

        if(!model){
          return Promise.reject({
            message: `Could not find model with name ${modelName}`
          });
        }

        let methods = model.sharedClass
          .methods({
            includeDisabled: false
          });

        return Promise.map(methods, function(method) {
          console.log(method);
          return method;
        });

      })
      .then(function(list) {
        return {
          list: list
        };
      });

  };

  Model.remoteMethod(
    'methods', {
      description: 'Get API remote methods from a specified model',
      accepts: [],
      returns: {
        arg: 'result',
        type: 'object',
        root: true
      },
      http: {
        verb: 'get',
        path: '/methods'
      },
    }
  );

};
