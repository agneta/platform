/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/core/database/local.js
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
var Database = require('warehouse');
var registerModels = require('../../pages/register_models');
var path = require('path');
var _ = require('lodash');

module.exports = function(locals) {

  var project = locals.project;

  var db = project.database = new Database({
    version: 1,
    path: path.join(project.paths.app.website, 'db.json')
  });

  project.model = function(name, schema) {
    return db.model(name, schema);
  };

  registerModels(project);

  var Page = db.model('Page');

  ////////////////////////////////////////////////

  _.extend(project.site, {
    pages: {
      find: function(query, options) {
        query = query || {};
        query.isSource = true;
        return Page.find.call(Page, query,options);
      },
      map: function() {
        return Page.map.apply(Page, arguments);
      },
      findOne: function(query) {
        return Page.findOne.call(Page, query);
      },
      findById: function(id) {
        return Page.findById.call(Page, id);
      }
    }
  });

  _.extend(project.locals, project.site);
  _.extend(project.locals.cache, project.site);

};
