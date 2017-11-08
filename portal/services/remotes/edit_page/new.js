/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/remotes/edit_page/new.js
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
var path = require('path');

module.exports = function(Model, app) {

  var web = app.get('options').web;
  var webPrj = web.project;

  Model.new = function(title, filePath, template, req) {

    var source = path.join(webPrj.paths.source, filePath + '.yml');

    var yamlTitle = {};
    yamlTitle[app.getLng(req)] = title;

    return app.process.git.createYaml(source, {
      title: yamlTitle,
      template: template
    })
      .then(function() {
        return {
          id: filePath
        };
      });

  };

  Model.remoteMethod(
    'new', {
      description: 'Create new page',
      accepts: [{
        arg: 'title',
        type: 'string',
        required: true
      }, {
        arg: 'path',
        type: 'string',
        required: true
      }, {
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
        verb: 'post',
        path: '/new'
      },
    }
  );

};
