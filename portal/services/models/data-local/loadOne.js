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
var yaml = require('js-yaml');
var Promise = require('bluebird');
var fs = require('fs-extra');
var readFile = Promise.promisify(fs.readFile);
var path = require('path');
var loadTemplate = require('../edit/loadTemplate');

module.exports = function(Model, app) {

  Model.loadOne = function(id, req) {

    var template;
    var log;
    var parsedId = Model.parseId(id);

    return loadTemplate({
      path: path.join(Model.editConfigDir, parsedId.templateId + '.yml'),
      req: req,
      app: app
    }).then(function(_template) {

      template = _template;
      template.id = parsedId.templateId;

      return app.git.log({
        file: parsedId.source
      });
    })
      .then(function(_log) {
        log = _log;
        return readFile(parsedId.source);
      })
      .then(function(content) {

        var data = yaml.safeLoad(content);

        return {
          page: {
            id: id,
            data: data,
            log: log,
            path: '/' + path.join(parsedId.templateId,parsedId.fileName)
          },
          template: template
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
