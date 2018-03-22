var path = require('path');
var fs = require('fs');
var _ = require('lodash');

module.exports = function(options) {

  var dirs = options.dirs;
  var app = options.app;
  var getModel = options.getModel;

  //--------------------------------------------------------

  function runRemote(key) {

    var name = key;
    var map = null;
    var Model = null;

    if (_.isObject(key)) {
      name = key.newName || key.model.definition.name;
      map = key.name;
      Model = key.model;
    } else {
      Model = app.models[name];
    }

    //--------------------------------

    var __findOrCreate = Model.findOrCreate;
    Model.findOrCreate = function(findOptions) {
      return __findOrCreate.apply(Model, arguments)
        .catch(function(err) {
          if (err.code == 11000) {
            return Model.findOne(findOptions)
              .then(function(item) {
                return [item];
              });
          }
          return Promise.reject(err);
        });
    };

    //--------------------------------

    Model.getCollection = function(name){
      return Model.dataSource.connector.collection(
        name || Model.definition.name
      );
    };

    //--------------------------------

    name = name.toLowerCase();

    if (map) {
      name = map.toLowerCase();
    }

    //--------------------------------

    Model.getModel = function(name){
      return getModel({
        name: name,
        model: this
      });
    };

    dirs.forEach(function(dir) {

      var file = path.join(dir, name) + '.js';
      var exists = fs.existsSync(file);

      if (!exists) {
        file = path.join(dir,name,'index.js');
        exists = fs.existsSync(file);
      }

      if (!exists) {
        return;
      }

      require(file)(Model, Model.app);


    });

  }

  return function(data){
    if(_.isArray(data)) {
      data.forEach(function(key) {
        runRemote(key);
      });
      return;
    }
    runRemote(data);

  };
};
