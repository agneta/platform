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
const _ = require('lodash');

module.exports = function(Model, app) {

  Model.loadOne = function(id,template, req) {

    var templateData;
    var item;
    var model;

    return Promise.resolve()
      .then(function() {
        return Model.loadTemplate({
          template: template,
          req: req
        });
      }).then(function(_templateData) {

        templateData = _templateData;
        return Model.getTemplateModel(template);

      })
      .then(function(_model) {
        model = _model;
        var include = _.map(templateData.relations,function(relation){
          return {
            relation: relation.name,
            scope: {
              fields: ['id'].concat(
                relation.display?_.values(relation.display):['title']
              )
            }};
        });
        return model.findById(id,{
          include:include
        });
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
      .then(function(log) {
        var relationNames = _.map(templateData.relations, 'name');
        var itemData = _.omit(item.__data, relationNames);
        var relations = _.pick(item.__data, relationNames);
        //console.log('relations',relations);
        relations = app.lngScan(relations,req);
        //console.log('relations.scanned',relations);

        return {
          page: {
            id: item.id,
            data: itemData,
            log: log
          },
          relations: relations,
          template: templateData
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
