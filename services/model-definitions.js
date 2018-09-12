/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/model-definitions.js
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

module.exports = function(app, generated) {
  app.modelSchemas = {};

  var definitions = generated._definitions;

  var dirs = app.get('services_include').map(function(dir) {
    return path.join(dir, 'models');
  });

  function mergeFn(objValue, srcValue) {
    if (_.isArray(objValue) || _.isArray(srcValue)) {
      objValue = objValue || [];
      srcValue = srcValue || [];
      return srcValue.concat(objValue);
    }
  }

  //-------------------------------------------

  return Promise.map(
    dirs,
    function(dir) {
      return fs
        .ensureDir(dir)
        .then(function() {
          return fs.readdir(dir);
        })
        .then(function(files) {
          return Promise.map(files, function(file) {
            var filePath = path.join(dir, file);
            var name = path.parse(filePath).name;

            return fs
              .stat(filePath)
              .then(function(stat) {
                if (stat.isDirectory()) {
                  let fileDir = filePath;
                  filePath = path.join(fileDir, 'index.json');
                  return fs.pathExists(filePath).then(function(exists) {
                    if (exists) {
                      return true;
                    }
                    filePath = path.join(fileDir, 'index.schema.js');
                    return fs.pathExists(filePath);
                  });
                }

                var fileParsed = path.parse(file);

                if (fileParsed.ext === '.json') {
                  return true;
                }

                var nameParsed = path.parse(fileParsed.name);

                if (fileParsed.ext === '.js' && nameParsed.ext == '.schema') {
                  name = nameParsed.name;
                  return true;
                }
              })
              .then(function(exists) {
                if (!exists) {
                  return;
                }

                var data = require(filePath);

                if (definitions[name]) {
                  _.mergeWith(definitions[name].definition, data, mergeFn);
                } else {
                  definitions[name] = {
                    definition: data
                  };
                }
              });
          });
        });
    },
    {
      concurrency: 1
    }
  ).then(function() {
    var values = _.values(definitions);
    values.forEach(function(value) {
      var definition = value.definition;
      //console.log(_.kebabCase(definition.name), definition.name);

      definition.http = definition.http || {};
      _.extend(definition.http, {
        path: _.kebabCase(definition.name)
      });

      definition.mixins = definition.mixins || {};
      _.extend(definition.mixins, {
        TimeStamp: true
      });

      app.modelSchemas[definition.name] = definition;
      //console.log(definition.name,definition.http.path);
    });
    generated.modelDefinitions = values;
  });
};
