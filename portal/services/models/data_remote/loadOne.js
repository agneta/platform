/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/models/data-remote/loadOne.js
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

module.exports = function(Model, app) {

  Model.loadOne = function(id,template, req) {

    var templateData;
    var item;
    var model;
    var log;
    var relations = {};

    return Promise.resolve()
      .then(function() {
        return Model.__loadTemplateData({
          template: template,
          req: req
        });
      }).then(function(_templateData) {

        templateData = _templateData;
        return Model.getTemplateModel(template);

      })
      .then(function(_model) {
        model = _model;
        return model.findById(id,templateData.display);
      })
      .then(function(_item) {

        item = _item;

        if(!item){
          return Promise.reject({
            statusCode: 404,
            message: `Could not find item with id: ${id}`
          });
        }

        return app.models.History.load({
          id: item.id,
          model: model
        });

      })
      .then(function(_log) {
        log = _log;
        return Promise.map(templateData.relations,function(relation){
          var templateData = null;
          var model = null;
          if(!relation.template){
            model = Model.getModel(relation.model);
            templateData = {
              field: {},
              list: {
                labels: relation.labels || {
                  title: 'title'
                }
              }
            };
          }
          return Model.__display({
            template: relation.template,
            templateData: templateData,
            model: model,
            req: req,
            id: item[relation.key]
          })
            .then(function(result){
              relations[relation.name] = result;
            });

        });
      })
      .then(function() {

        return {
          page: {
            id: item.id,
            data: item.__data,
            log: log
          },
          relations: relations
        };

      });
  };

  Model.remoteMethod(
    'loadOne', {
      description: 'Load Project Data with specified ID',
      accepts: [{
        arg: 'id',
        type: 'string',
        required: true
      },{
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
        path: '/load-one'
      },
    }
  );

};
