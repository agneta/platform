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
var Promise = require('bluebird');

module.exports = function(Model, app) {

  Model.loadMany = function(template, req) {

    return Promise.resolve()
      .then(function() {

        return Model.getTemplateModel(template);
      })
      .then(function(model) {

        return model.find();
      })
      .then(function(items) {

        return Promise.map(items, function(item) {
          return {
            title: app.lng(item.title, req),
            path: '/' + [template, item.name].join('/'),
            id: item.id
          };
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
