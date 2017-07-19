/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/pages/register_models.js
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
'use strict';

var models = require('./models');

module.exports = function(ctx){
  var db = ctx.database;

  var keys = Object.keys(models);
  var key = '';

  for (var i = 0, len = keys.length; i < len; i++){
    key = keys[i];
    db.model(key, models[key](ctx));
  }
};