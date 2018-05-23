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

  const fields = require('./fields')(app);
  const list = require('./list');
  const relations = require('./relations')(app);

  let cache = LRU({
    max: 100
  });

  app.edit.clearCache = function(options){
    options = options || {};

    if(options.path){
      return cache.del(options.path);
    }
    cache.clear();
  };

  app.edit.loadTemplate = function(options) {

    options = _.cloneDeep(options);

    return Promise.resolve()
      .then(function() {

        if(options.path){
          let template = cache.get(options.path);

          if(template){
            //console.log('loaded from cache',options.path);
            options.data = template;
            return;
          }
        }

        return Promise.resolve()
          .then(function() {

            if(options.data){
              return options.data;
            }

            return Promise.resolve()
              .then(function() {

                return fs.exists(options.path)
                  .then(function(exists){
                    if(!exists){
                      throw new Error(`Could not find template with path: ${options.path}`);
                    }
                    return fs.readFile(options.path);
                  })
                  .then(function(content) {
                    let template = yaml.safeLoad(content);
                    if(!_.isObject(template)){
                      throw new Error(`Invalid template at: ${options.path}`);
                    }
                    template.id = template.id || path.parse(options.path).name;
                    return template;
                  });

              });
          })
          .then(function(template) {
            options.data = template;

            if (options.base) {
              options.data.fields = options.base.concat(options.data.fields);
            }

            if(!options.data){
              return Promise.reject({
                statusCode: 400,
                message: `No template data found for path: ${options.path}`
              });
            }

            fields(template);
            list(template);

          })
          .then(function() {

            if(options.skipScan){
              return;
            }

            if(options.path){
              options.basePath = path.parse(options.path).dir;
            }

            return relations(options)
              .then(function(template){
                options.data = template;
                if(options.path){
                  cache.set(options.path, template);
                }
              });
          });
      })
      .then(function() {
        if(!options.data){
          throw new Error(`Cannot ${options.path}`);
        }
        return options.data;
      });


  };

};
