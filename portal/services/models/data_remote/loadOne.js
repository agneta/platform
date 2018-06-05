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
          template: template
        });
      }).then(function(_templateData) {

        templateData = _templateData;
        return Model.getTemplateModel(template);

      })
      .then(function(_model) {
        model = _model;
        return model.findById(id);
      })
      .then(function(_item) {

        item = _item;

        if(!item){
          return Promise.reject({
            statusCode: 404,
            message: `Could not find item with id: ${id}`
          });
        }

        //console.log(require('util').inspect(item, { depth: null }));

        return Promise.all([
          app.models.History.load({
            id: item.id,
            model: model
          })
            .then(function(_log) {
              log = _log;
            }),
          Promise.map(templateData.relations,function(relation){

            if (relation.type != 'relation-belongsTo') {
              return;
            }

            let itemId = item[relation.key];
            if(!itemId){
              return;
              //throw new Error(`Relation needs to have an ID at field: ${relation.key}`);
            }

            var templateData = null;
            var model = null;
            if(relation.templateData){
              model = Model.getModel(relation.model);
              templateData = relation.templateData;
            }

            return Model.__display({
              template: relation.template,
              templateData: templateData,
              model: model,
              req: req,
              id: itemId
            })
              .then(function(result){
                relations[relation.name] = result;
              });

          })
        ]);
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
