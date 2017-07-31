/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/server/boot/01-models.js
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
var path = require('path');
var fs = require('fs');
var _ = require('lodash');

module.exports = function(app) {

  var dirs = [
    path.join(__dirname, '../remotes'),
    path.join(app.get('services_dir'), 'remotes')
  ];

  var servicesInclude = app.get('services_include');

  for (var dir of servicesInclude) {
    dirs.push(path.join(dir, 'remotes'));
  }

  function getModel(name) {
    var thisName = this.definition.name;
    if (thisName.indexOf('Production_') === 0) {
      return app.models['Production_' + name];
    }
    return app.models[name];
  }

  function runRemotes(keys) {

    dirs.forEach(function(dir) {

      keys.forEach(function(key) {
        _runRemote(key, dir);
      });

    });

  }

  function runRemote(key) {

    dirs.forEach(function(dir) {

      _runRemote(key, dir);

    });

  }

  function _runRemote(key, dir) {
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
      return __findOrCreate.apply(Model,arguments)
        .catch(function(err) {
          if (err.code == 11000) {
            return Model.findOne(findOptions)
              .then(function(item){
                return [item];
              });
          }
          return Promise.reject(err);
        });
    };
    //--------------------------------

    name = name.toLowerCase();

    if (map) {
      name = map.toLowerCase();
    }

    var file = path.join(dir, name) + '.js';

    if (fs.existsSync(file)) {
      require(file)(Model, app);
    }

    //--------------------------------

    Model.getModel = getModel;
  }

  runRemotes(
    _.keys(app.models)
  );

  app.helpers.runRemotes = runRemotes;
  app.helpers.runRemote = runRemote;


};
