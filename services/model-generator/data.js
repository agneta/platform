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
var yaml = require('js-yaml');
const dataDefinition = require('./data-definition');

module.exports = function(app, config) {

  var dataDir = path.join(
    process.cwd(), 'edit/data-remote'
  );

  app.dataRemote = {};

  return Promise.resolve()
    .then(function() {
      return fs.ensureDir(dataDir);
    })
    .then(function() {
      return fs.readdir(dataDir);
    })
    .then(function(files) {
      return Promise.map(files, function(filePath) {

        return fs.readFile(
          path.join(dataDir, filePath)
        )
          .then(function(content) {

            var data = yaml.safeLoad(content);
            data.name = data.name || path.parse(filePath).name;

            let definition = dataDefinition(app,data);
            let fileName = data.model.toLowerCase() + '.json';

            app.dataRemote[data.name] = {
              title: data.title,
              modelName: definition.name
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

};
