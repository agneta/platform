/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/pages/models/cache.js
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

module.exports = function(){
  var Cache = new Schema({
    _id: {type: String, required: true},
    shasum: {type: String},
    modified: {type: Number, default: Date.now}
  });

  return Cache;
};
