/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/models/edit/loadTemplate.js
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
const _ = require('lodash');
const path = require('path');

module.exports = function(app) {

  app.edit.loadTemplate = function(options){

    var web = app.get('options');
    web = web.web || web.client;
    var webHelpers = web.app.locals;

    if(options.path){

      return fs.readFile(options.path)
        .then(function(content) {
          var template = yaml.safeLoad(content);
          template.id = template.id || path.parse(options.path).name;

          template = scanTemplate(template);
          return template;
        });
    }

    if(options.data){
      return scanTemplate(options.data);
    }

    function scanTemplate(template){
      function scan(collection) {

        for (var key in collection) {
          collection[key] = getField(collection[key]);
        }

        function getField(field) {

          if (_.isString(field)) {
            var name = field;
            field = webHelpers.get_data('edit/fields/' + field);
            field.name = name;
          }

          if (_.isObject(field)) {
            if (field.extend) {
              _.defaults(field, getField(field.extend));
              field.name = field.extend;
              delete field.extend;
            }
          }

          if (field.fields) {
            scan(field.fields);
          }

          return field;
        }

      }

      scan(template.fields);

      if(options.req){
        template.title = app.lng(template.title, options.req);
      }

      template.fieldNames = _.map(template.fields,
        function(field){
          return field.name;
        });

      var relations = [];
      template.fields.forEach(function(field){
        if(field.type=='relation'){
          if(!field.relation){
            throw new Error(`Field must have a relation object (${field.name})`);
          }
          relations.push(field.relation.template);
        }
      });
      template.relations = relations;

      return template;
    }
  };

};
