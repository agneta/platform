/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/pages/models/index.js
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

var models = {};
models.Cache = require('./cache');
models.Data = require('./data');
models.Page = require('./page');

module.exports = function(locals) {
  var db = locals.project.database;

  var keys = Object.keys(models);
  var key = '';

  for (var i = 0, len = keys.length; i < len; i++) {
    key = keys[i];
    db.model(key, models[key](locals));
  }
};
