/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/models/page/loadMany.js
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

  var webPrj = app.get('options').web.project;


  Model.loadMany = function(template, req) {

    var pages = webPrj.site.pages.find({
      template: template
    }).toArray();

    return Promise.map(pages, function(page) {

      return {
        id: page.path,
        title: app.lng(page.title, req),
        path: page.path
      };

    })
      .then(function(result) {
        return {
          pages: result
        };
      });

  };

  Model.remoteMethod(
    'loadMany', {
      description: 'Load all pages by template',
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
