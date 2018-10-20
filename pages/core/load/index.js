/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/core/load/index.js
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

module.exports = function(locals) {
  var config = require('./config')(locals);
  var scripts = require('./scripts')(locals);
  var pages = require('./pages')(locals);
  var loadConfig = locals.load;

  return {
    pages: pages.load,
    config: config.load,
    scripts: scripts,
    preInit: config.preInit,
    init: function() {
      return config.init().then(function() {
        if (loadConfig.scripts) {
          return scripts();
        }
      });
    },
    start: function() {
      return Promise.resolve().then(function() {
        if (loadConfig.pages) {
          return pages.start().then(function() {
            pages.load();
          });
        }
      });
    }
  };
};
