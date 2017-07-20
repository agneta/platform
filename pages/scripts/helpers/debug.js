/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/scripts/helpers/debug.js
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
var util = require('util');

module.exports = function(locals) {

  var project = locals.project;

  // this solves circular reference in object
  function inspectObject(object, options) {
    var result = util.inspect(object, options);
    console.log(result);
    return result;
  }

  exports.inspectObject = inspectObject;

  project.extend.helper.register('inspect', inspectObject);

};
