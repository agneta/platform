/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/model-generator/data.js
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
var fs = require('fs-extra');
var Promise = require('bluebird');
const dataDefinition = require('./data-definition');

module.exports = function(app, config) {

  var dataDirs = [];

  for(var name in app.paths.app.extensions){
    var extPaths = app.paths.app.extensions[name];
    dataDirs.push(extPaths.editDataRemote);
  }

  dataDirs.push(app.paths.app.editDataRemote);

  app.dataRemote = {};

  return Promise.map(dataDirs,function(dataDir){
    return Promise.resolve()
      .then(function() {
        return fs.ensureDir(dataDir);
      })
      .then(function() {
        return fs.readdir(dataDir);
      })
      .then(function(files) {
        return Promise.map(files, function(filePath) {

          var dataPath = path.join(dataDir, filePath);
          var template;

          return Promise.resolve()
            .then(function(){
              return app.edit.loadTemplate({
                path: dataPath
              });
            })
            .then(function(_template){
              template = _template;
              return dataDefinition(app,template);
            })
            .then(function(definition){
              let fileName = template.model.toLowerCase() + '.json';

              app.dataRemote[template.id] = {
                title: template.title,
                modelName: definition.name,
                path: dataPath
              };

              config._definitions[fileName] = {
                definition: definition
              };

              config.models[definition.name] = {
                dataSource: 'db',
                public: true
              };

            });

        });
      });
  });

};
