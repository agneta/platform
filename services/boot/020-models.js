/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/boot/020-models.js
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

  var paths = app.get('options').paths;
  //console.log('paths',paths);

  var dirs = [
    paths.appPortal.models,
    path.join(__dirname, '../models'),
    path.join(app.get('services_dir'), 'models')
  ];

  var servicesInclude = app.get('services_include');

  for (var dir of servicesInclude) {
    dirs.push(path.join(dir, 'models'));
  }

  dirs = _.uniq(dirs);
  //console.log('dirs',dirs);

  //--------------------------------------------------------

  function getModel(name) {
    if (this.__isProduction) {
      return app.models['Production_' + name];
    }
    return app.models[name];
  }

  //--------------------------------------------------------

  function runRemotes(keys) {

    keys.forEach(function(key) {
      runRemote(key);
    });

  }

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

    Model.getModel = getModel;

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

  //--------------------------------------------------------

  runRemotes(
    _.keys(app.models)
  );

  app.helpers.runRemotes = runRemotes;
  app.helpers.runRemote = runRemote;


};
