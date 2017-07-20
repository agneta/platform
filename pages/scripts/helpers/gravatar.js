/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/scripts/helpers/gravatar.js
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

var crypto = require('crypto');
var querystring = require('querystring');

module.exports = function(locals) {

  var project = locals.project;

  function md5(str) {
    return crypto.createHash('md5').update(str).digest('hex');
  }

  function gravatarHelper(email, options) {
    if (typeof options === 'number') {
      options = {
        s: options
      };
    }

    var str = 'http://www.gravatar.com/avatar/' + md5(email.toLowerCase());
    var qs = querystring.stringify(options);

    if (qs) str += '?' + qs;

    return str;
  }

  project.extend.helper.register('gravatar', gravatarHelper);

};
