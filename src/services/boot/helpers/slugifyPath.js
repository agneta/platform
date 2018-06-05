/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/boot/helpers/slugifyPath.js
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
const S = require('string');
const path = require('path');

module.exports = function(pagePath) {

  pagePath = path.normalize(pagePath);
  pagePath = pagePath.split('/');

  if (!pagePath[0].length) {
    pagePath.shift();
  }

  if (!pagePath[pagePath.length - 1].length) {
    pagePath.pop();
  }

  for (var i in pagePath) {
    pagePath[i] = S(pagePath[i]).slugify().s;
  }

  return pagePath.join('/');
};
