/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/boot/watcher/source.js
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
const path = require('path');

module.exports = function(watcher) {

  var locals = watcher.locals;
  var reload = watcher.reload;

  return function(pathFile) {
    var params = path.parse(pathFile);

    switch (params.ext) {

      case '.yml':
        return locals.main.load.pages();
      case '.styl':
        reload();
        break;
      case '.js':
        reload();
        break;
      case '.ejs':
        locals.cache.templates.invalidate(pathFile);
        reload();
        break;
    }

  };
};
