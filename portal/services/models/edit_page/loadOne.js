/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/remotes/edit_page/loadOne.js
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
const fs = require('fs-extra');
const yaml = require('js-yaml');
const path = require('path');
const templateBase = require('./templateBase');
const loadTemplate = require('../edit/loadTemplate');

module.exports = function(Model, app) {

  var source;
  var template;

  Model.loadOne = function(id, req) {

    var page;
    var log;

    return Model.getPage(id)
      .then(function(_page) {

        //////////////////////////////////////////
        page = _page;
        source = Model.pageSource(page);

        return app.git.log({
          file: source
        });

      })
      .then(function(_log) {

        log = _log;

        return loadTemplate({
          path: path.join(Model.editConfigDir, page.template + '.yml'),
          req: req,
          app: app
        });

      })
      .then(function(_template) {

        template = _template;
        template.id = page.template;
        templateBase(template);

        return fs.readFile(source);
      })
      .then(function(content) {

        var data = yaml.safeLoad(content);

        return {
          page: {
            data: data,
            path: page.path,
            id: id,
            log: log
          },
          template: template
        };
      });

  };

  Model.remoteMethod(
    'loadOne', {
      description: 'Load page with specified ID',
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
