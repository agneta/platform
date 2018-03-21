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
const S = require('string');

module.exports = function(app, generated) {

  app.modelSchemas = {};

  var definitions = generated._definitions;
  var servicesInclude = app.get('services_include');

  var dirs = [
    path.join(__dirname, 'models'),
    path.join(app.get('services_dir'), 'models')
  ];

  for (var dir of servicesInclude) {
    dirs.push(path.join(dir, 'models'));
  }

  function mergeFn(objValue, srcValue) {
    if (_.isArray(objValue) || _.isArray(srcValue)) {
      objValue = objValue || [];
      srcValue = srcValue || [];
      return srcValue.concat(objValue);
    }
  }

  //-------------------------------------------

  return Promise.map(dirs, function(dir) {

    return fs.ensureDir(dir)
      .then(function() {
        return fs.readdir(dir);
      })
      .then(function(files) {

        return Promise.map(files, function(file) {

          var filePath = path.join(dir, file);
          var name = path.parse(filePath).name;

          return fs.stat(filePath)
            .then(function(stat){

              if(stat.isDirectory()){
                filePath = path.join(filePath,'index.json');
                return fs.pathExists(filePath);
              }

              if(path.parse(file).ext === '.json'){
                return true;
              }

            })
            .then(function(exists) {

              if(!exists){
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
  }, {
    concurrency: 1
  })
    .then(function() {
      var values = _.values(definitions);
      values.forEach(function(value) {

        var definition = value.definition;

        definition.http = definition.http || {};
        _.extend(definition.http,{
          path: S(definition.name).slugify().s
        });

        definition.mixins = definition.mixins || {};
        _.extend(definition.mixins,{
          mixins: {
            'TimeStamp': true
          }
        });

        app.modelSchemas[definition.name] = definition;
        //console.log(definition.name,definition.http.path);
      });
      generated.modelDefinitions = values;
    });


};
