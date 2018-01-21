/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/models/edit_data/loadOne.js
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
var Promise = require('bluebird');
var path = require('path');

module.exports = function(Model, app) {

  Model.loadOne = function(id,template, req) {
    var templateData;
    return Promise.resolve()
      .then(function() {
        return app.edit.loadTemplate({
          path: path.join(Model.editConfigDir, template + '.yml'),
          req: req
        });
      }).then(function(_templateData) {

        templateData = _templateData;
        return Model.getTemplateModel(template);

      })
      .then(function(model) {
        return model.findById(id);
      })
      .then(function(item) {

        return {
          page: {
            id: item.id,
            data: item,
            path: `/${item.name}`
          },
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
