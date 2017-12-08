/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/boot/watcher/scripts.js
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

  return function(pathFile) {
    var params = path.parse(pathFile);

    switch (params.ext) {
      case '.js':

        var name = params.name;
        console.log('model name update',name);
        var model = locals.app.models(name);
        if(model){
          console.log('test');
        }
        break;
    }

  };
};
