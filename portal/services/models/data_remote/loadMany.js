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
const _ = require('lodash');

module.exports = function(Model, app) {

  Model.loadMany = function(template, order, req) {

    var labels;
    var findFields = {};
    var templateData;
    var includeFields = [];

    return Promise.resolve()
      .then(function() {

        return Model.__loadTemplate({
          template: template
        });

      })
      .then(function(_templateData) {
        templateData = _templateData;
        labels = templateData.list.labels;

        for(let key in labels){
          checkLabel(key);
        }

        labels.metadata = labels.metadata || [];
        for(let label of labels.metadata){
          checkLabel(label);
        }

        function checkLabel(label){

          label = labels[label] || label;
          var field = templateData.field[label] || {};

          if(field.relation){
            includeFields.push({
              relation: field.relation.template,
              scope:{
                fields: [field.relation.label]
              }
            });
            return;
          }
          findFields[label] = true;
        }

        return Model.getTemplateModel(template);
      })
      .then(function(model) {
        _.extend(findFields,{
          id: true
        });
        return model.find({
          fields: findFields,
          include: includeFields,
          order: order
        });
      })
      .then(function(items) {

        return Promise.mapSeries(items, function(item) {
          item = item.__data;
          var result = {
            id: item.id,
            metadata: []
          };

          result.title = getItem('title');
          result.subtitle = getItem('subtitle');
          result.image = getItem('image');

          for(let label of labels.metadata){
            let data = getItem(label);
            if(data){
              result.metadata.push(data);
            }
          }

          function getItem(label){
            label = labels[label]||label;
            var value;
            var field = templateData.field[label] || {};
            //console.log(field,item);
            if(field.relation){
              value = item[field.relation.template];
              if(value){
                value = value[field.relation.label];
              }
            }else{
              value = item[label];
            }
            var type = field.type;

            if(!value){
              return;
            }

            switch(field.type){
              case 'date-time':
                type = 'date';
                value = value+'';
                break;
              case 'media':
                value = value.location;
                break;
              case 'select':
                value = _.get(
                  _.find(field.options,{value:value}),'title'
                ) || value;
                break;
            }

            if(_.isObject(value)){
              value = app.lng(value, req);
            }

            return {
              type: type,
              value: value
            };

          }

          return result;
        });
      })
      .then(function(pages) {

        return {
          pages: pages
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
        arg: 'order',
        type: 'string',
        required: false
      },{
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
