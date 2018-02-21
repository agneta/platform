/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/models/data-local/loadMany.js
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
var readdir = Promise.promisify(fs.readdir);
var readFile = Promise.promisify(fs.readFile);

module.exports = function(Model, app) {

  var webProject = app.get('options').web.project;

  Model.loadMany = function(template, req) {

    var templateDir = path.join(webProject.paths.app.data, template);

    return Promise.resolve()
      .then(function() {
        return fs.ensureDir(templateDir);
      })
      .then(function() {
        return readdir(templateDir);
      })
      .then(function(files) {

        return Promise.map(files, function(fileName) {
          return readFile(
            path.join(templateDir, fileName)
          )
            .then(function(content) {

              var data = yaml.safeLoad(content);
              var fileNameParsed = path.parse(fileName);
              var name = fileNameParsed.name;
              var id = [template, name].join('/');
              return {
                title: app.lng(data.title, req),
                path: '/' + id,
                id: id
              };
            });
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
      description: 'Load all pages with optional limit',
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
