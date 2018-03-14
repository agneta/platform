/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/boot/watcher/models.js
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
const path = require('path');
const fs = require('fs-extra');
const Promise = require('bluebird');
const _ = require('lodash');

module.exports = function(watcher) {

  var locals = watcher.locals;
  var app = locals.services;

  return function(pathFile) {
    var params = path.parse(pathFile);

    switch (params.ext) {
      case '.js':
        //console.log(pathFile);
        return getModel(pathFile)
          .then(function(model) {

            if (!model) {
              return;
            }

            //console.log('found model', model.definition.name);

            delete require.cache[require.resolve(pathFile)];

            try {
              var script = require(pathFile);

              if (_.isFunction(script)) {
                script(model, app);
              }
            } catch (err) {
              console.error(err);
            }

          });
    }

  };

  function getModel(pathFile) {

    var pathParsed = path.parse(pathFile);
    var modelPath;
    var model;

    return Promise.map([
      locals.project.paths.core.models,
      locals.project.paths.app.models
    ], function(dir) {
      modelPath = path.join(dir, pathParsed.name) + '.json';

      var exists = fs.existsSync(modelPath);

      if (!exists) {
        modelPath = path.join(dir,pathParsed.name,'index.json');
        exists = fs.existsSync(modelPath);
      }

      if(!exists){
        modelPath = path.join(dir,
          path.parse(pathParsed.dir).name,
          'index.json');
        exists = fs.existsSync(modelPath);
      }

      if(!exists){
        return;
      }

      var definition = require(modelPath);
      if (!definition.name) {
        return;
      }

      model = app.models[definition.name];

    })
      .then(function() {
        if (!model) {
          var name = pathParsed.name;
          var nameParts = name.split('_');
          var modelName = [];
          for (var part of nameParts) {
            modelName.push(
              part[0].toUpperCase() + part.slice(1)
            );
          }
          modelName = modelName.join('_');
          model = app.models[modelName];
        }
        return model;
      });


  }

};
