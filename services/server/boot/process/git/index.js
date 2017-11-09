/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/boot/git.js
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

module.exports = function(app) {

  var webPrj = app.get('options').client.project;

  function getPath(value) {
    if (value.indexOf(webPrj.paths.project) === 0) {
      return path.relative(
        webPrj.paths.project,
        value);
    }

    return value;
  }

  app.process.git = {
    getPath: getPath,
    name: '.git'
  };

  require('./addAll')(app);
  require('./createYaml')(app);
  require('./update')(app);
  require('./log')(app);
  require('./status')(app);
  require('./readFile')(app);
  require('./readYaml')(app);
  require('./push')(app);

  return require('./init')(app);

};
