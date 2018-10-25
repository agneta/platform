var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var Promise = require('bluebird');

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
      return __findOrCreate.apply(Model, arguments).catch(function(err) {
        if (err.code == 11000) {
          return Model.findOne(findOptions).then(function(item) {
            return [item];
          });
        }
        return Promise.reject(err);
      });
    };

    //--------------------------------

    var __upsertWithWhere = Model.upsertWithWhere;
    Model.upsertWithWhere = function() {
      var args = arguments;

      return __upsertWithWhere.apply(Model, args).catch(function(err) {
        if (err.code == 11000) {
          return Model.upsertWithWhere.apply(Model, args);
        }
        return Promise.reject(err);
      });
    };

    //--------------------------------

    Model.map = function(callback, options) {
      let skipIndex = 0;
      options = options || {};
      function find() {
        return Model.find({
          limit: 20,
          skipIndex: skipIndex
        }).then(function(items) {
          return Promise.map(
            items,
            function(item) {
              return callback(item);
            },
            {
              concurrency: options.concurrency || 5
            }
          ).then(function() {
            if (!items || !items.length) {
              return;
            }
            skipIndex += items.length;
            return find();
          });
        });
      }

      return find();
    };

    //--------------------------------

    Model.getCollection = function(name) {
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

    Model.getModel = function(name) {
      return getModel({
        name: name,
        model: this
      });
    };

    dirs.forEach(function(dir) {
      var file = path.join(dir, name) + '.js';
      var exists = fs.existsSync(file);

      if (!exists) {
        file = path.join(dir, name, 'index.js');
        exists = fs.existsSync(file);
      }

      if (!exists) {
        return;
      }

      require(file)(Model, Model.app);
    });
  }

  return function(data) {
    if (_.isArray(data)) {
      data.forEach(function(key) {
        runRemote(key);
      });
      return;
    }
    runRemote(data);
  };
};
