/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/pages/models/page.js
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
var Schema = require('warehouse').Schema;
var pathFn = require('path');

module.exports = function(locals) {
  var project = locals.project;
  var basePath = pathFn.relative(
    project.paths.app.website,
    project.paths.app.source
  );

  var Model = new Schema({
    id: String,
    title: {
      type: Object,
      required: true
    },
    source: {
      type: String,
      required: false
    },
    path: {
      type: String,
      required: true
    }
  });

  Model.virtual('full_source').get(function() {
    return pathFn.join(basePath, this.source || '');
  });
  if (!locals.web) {
    Model.pre('save', function(data) {
      var Page = locals.services.models.Page;

      return Promise.resolve().then(function() {
        if (!Page.sync) {
          return;
        }
        return Page.sync(data);
      });
    });
  }

  return Model;
};
