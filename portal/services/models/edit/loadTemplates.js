/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/models/edit/loadTemplates.js
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
var fs = require('fs-extra');
var path = require('path');
var Promise = require('bluebird');
var yaml = require('js-yaml');
var klaw = require('klaw');

module.exports = function(Model, app) {

  Model.loadTemplates = function(req) {

    var items = [];

    return Promise.resolve()
      .then(function() {
        return fs.ensureDir(Model.editConfigDir);
      })
      .then(function() {

        return new Promise(function(resolve, reject) {

          klaw(Model.editConfigDir)
            .on('data', function(item) {
              if (!item.stats.isFile()) {
                return;
              }
              items.push(item);
            })
            .on('error', reject)
            .on('end', resolve);

        });
      })
      .then(function() {

        return Promise.map(items, function(item) {
          return fs.readFile(item.path)
            .then(function(content) {
              var data = yaml.safeLoad(content);
              var id = path.relative(Model.editConfigDir, item.path).slice(0, -4);
              return {
                id: id,
                title: app.lng(data.title, req),
                path_default: data.path_default
              };
            });

        });
      })
      .then(function(templates) {
        return {
          templates: templates
        };
      });

  };

  Model.remoteMethod(
    'loadTemplates', {
      description: 'Load all templates with optional limit',
      accepts: [{
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
        path: '/load-templates'
      },
    }
  );

};
