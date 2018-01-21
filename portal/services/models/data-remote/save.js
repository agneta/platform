/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/models/edit_data/save.js
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
const _ = require('lodash');
const path = require('path');
module.exports = function(Model, app) {

  var clientHelpers = app.get('options').client.app.locals;

  Model.save = function(id, template, data) {

    var templateData;
    var model;

    return Promise.resolve()
      .then(function() {
        return app.edit.loadTemplate({
          path: path.join(Model.editConfigDir, template + '.yml'),
        });
      })
      .then(function(_templateData) {
        templateData = _templateData;
        return Model.getTemplateModel(template);
      })
      .then(function(_model) {
        model = _model;

        return model.findById(id);
      })
      .then(function(item) {
        if(!item){
          return Promise.reject({
            statusCode: 404,
            message: `Item not found with id: ${id}`
          });
        }
        data = clientHelpers.get_values(data);
        data = _.pick(data,templateData.fieldNames);
        console.log(data);
        return item.updateAttributes(data);
      });


  };

  Model.remoteMethod(
    'save', {
      description: 'Save project data',
      accepts: [{
        arg: 'id',
        type: 'string',
        required: true
      }, {
        arg: 'template',
        type: 'string',
        required: true
      }, {
        arg: 'data',
        type: 'object',
        required: true
      }],
      returns: {
        arg: 'result',
        type: 'object',
        root: true
      },
      http: {
        verb: 'post',
        path: '/save'
      },
    }
  );

};
