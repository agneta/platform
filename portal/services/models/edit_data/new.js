/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/remotes/edit_data/new.js
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

  Model.new = function(title, dataPath, template, req) {

    var id = path.join(template, dataPath);
    var source = path.join(webPrj.paths.app.data, id + '.yml');

    var yamlTitle = {};
    yamlTitle[app.getLng(req)] = title;

    var name = path.parse(dataPath).name;

    return app.git.createYaml(source, {
      name: name,
      title: yamlTitle
    })
      .then(function() {
        return {
          id: id
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
