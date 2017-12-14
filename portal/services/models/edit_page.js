/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/models/edit_page.js
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
var fs = require('fs-extra');
var Promise = require('bluebird');

module.exports = function(Model, app) {

  Model.omitData = [
    '_model',
    '_schema',
    'source',
    'slug',
    'published',
    'date',
    'updated',
    'filename',
    '_id',
    'id',
    'isSource',
    'controller',
    'scripts',
    'styles',
    'isSource',
    'pathSource',
    'pathView',
    'pathData',
    'path',
    'path_name',
    'full_source'
  ];

  var webPrj = app.get('options').web.project;

  Model.editConfigDir = path.join(webPrj.paths.core.project, 'edit', 'pages');
  fs.ensureDirSync(Model.editConfigDir);

  Model.getPage = function(path) {

    var page = webPrj.site.pages.findOne({
      path: path
    });

    if (!page) {

      return Promise.reject({
        statusCode: 400,
        message: 'Page not found: ' + path
      });
    }

    return Promise.resolve(page);
  };

  Model.pageSource = function(page) {
    return path.join(webPrj.paths.app.website, page.full_source);
  };

  require('./edit_page/loadCommit')(Model, app);
  require('./edit_page/loadOne')(Model, app);
  require('./edit_page/delete')(Model, app);
  require('./edit_page/save')(Model, app);
  require('./edit_page/new')(Model, app);
  require('./edit_page/loadMany')(Model, app);
  require('./edit/loadTemplates')(Model, app);

};
