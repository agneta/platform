/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/lib/edit/loadTemplate.js
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
const fs = require('fs-extra');
const yaml = require('js-yaml');
const path = require('path');
const _ = require('lodash');
const LRU = require('lru-cache');

module.exports = function(app) {

  var cache = LRU({
    max: 20
  });

  app.edit.loadTemplate = function(options) {

    options = _.cloneDeep(options);
    var template;

    return Promise.resolve()
      .then(function() {

        if(!options.path){
          return;
        }
        return Promise.resolve()
          .then(function() {

            template = cache.get(options.path);
            if(template){
              return;
            }
            return fs.exists(options.path)
              .then(function(exists){
                if(!exists){
                  throw new Error(`Could not find template with path: ${options.path}`);
                }
                return fs.readFile(options.path);
              })
              .then(function(content) {
                template = yaml.safeLoad(content);
                if(!_.isObject(template)){
                  throw new Error(`Invalid template at: ${options.path}`);
                }
                template.id = template.id || path.parse(options.path).name;
                cache.set(options.path, template);
              });

          })
          .then(function() {
            template = _.clone(template);
            options.data = template;

          });

      })
      .then(function() {

        if (options.base) {
          options.data.fields = options.base.concat(options.data.fields);
        }

        if(!options.data){
          return Promise.reject({
            statusCode: 400,
            message: `No template data found for path: ${options.path}`
          });
        }

        if(options.path){
          options.basePath = path.parse(options.path).dir;
        }

        if(options.skipScan){
          return;
        }

        template = app.edit.scanTemplate(options);

      })
      .then(function() {
        return template;
      });


  };

};
