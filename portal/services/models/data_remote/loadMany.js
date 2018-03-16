/*   Copyright 2017 Agneta Network Applications, LLC.
*
*   Source file: portal/services/models/data-remote/loadMany.js
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
const Promise = require('bluebird');
const path = require('path');
const _ = require('lodash');

module.exports = function(Model, app) {

  Model.loadMany = function(template, req) {

    var label;
    var findFields;
    var templateData;

    return Promise.resolve()
      .then(function() {

        return app.edit.loadTemplate({
          path: path.join(Model.editConfigDir, template + '.yml'),
        });

      })
      .then(function(_templateData) {
        templateData = _templateData;
        label = templateData.label || {
          title: 'title',
          subtitle: 'path'
        };
        findFields = _.zipObject(
          _.values(label),
          _.map(_.keys(label),function(){return true;})
        );
        return Model.getTemplateModel(template);
      })
      .then(function(model) {
        _.extend(findFields,{
          id: true
        });
        return model.find({
          fields: findFields
        });
      })
      .then(function(items) {

        return Promise.map(items, function(item) {

          var result = {
            id: item.id,
            title: formatField(label.title),
            subtitle: formatField(label.subtitle)
          };

          return result;

          function formatField(label){
            var value = item[label];
            var type = null;
            var field = templateData.fields[
              templateData.fieldNames.indexOf(label)
            ] || {};

            switch(field.type){
              case 'date-time':
                type = 'date';
                value = value+'';
                break;
              case 'select':
                value = _.get(
                  _.find(field.options,{value:value}),'title'
                ) || value;
                break;
            }

            console.log(field,value);

            if(_.isObject(value)){
              value = app.lng(value, req);
            }

            return {
              type: type,
              value: value
            };

          }
        });
      })
      .then(function(result) {

        return {
          pages: result
        };
      });

  };


  Model.remoteMethod(
    'loadMany', {
      description: 'Load all remote data with specified template',
      accepts: [{
        arg: 'template',
        type: 'string',
        required: true
      }, {
        arg: 'req',
        type: 'object',
        'http': {
          source: 'req'
        }
      }],
      returns: {
        arg: 'result',
        type: 'object',
        root: true
      },
      http: {
        verb: 'get',
        path: '/load-many'
      },
    }
  );

};
