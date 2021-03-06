/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/boot/009-configstore.js
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
const configstore = require('configstore');
const path = require('path');
const fs = require('fs');
const _ = require('lodash');

module.exports = function(app) {
  var pkgFile = path.join(process.cwd(), 'package.json');
  var pkg = fs.existsSync(pkgFile) ? require(pkgFile) : {};

  var name = pkg.name || path.parse(process.cwd()).name;
  name = _.snakeCase(name);

  app.configstore = new configstore(
    path.join('project', name),
    {},
    {
      globalConfigPath: true
    }
  );
};
