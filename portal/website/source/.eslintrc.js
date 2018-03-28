/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/source/.eslintrc.js
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
var path = require('path');

module.exports = {
  "globals": {
    angular: true,
    agneta: true,
    module: true,
    require: true,
    $$template: true
  },
  "env": {
    "browser": true,
    "node": false,
    "es6": true
  },
  "rules": {
    "node/no-missing-require": ["error", {
      "allowModules": [],
      "resolvePaths": [
        path.join(__dirname,'../../../theme/source'),
        __dirname
      ],
      "tryExtensions": [".js", ".json", ".node"]
    }]
  }
}
