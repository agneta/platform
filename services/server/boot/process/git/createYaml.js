/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/boot/git/createYaml.js
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
var Promise = require('bluebird');
var yaml = require('js-yaml');
var fs = require('fs-extra');

module.exports = function(app) {

  app.process.git.createYaml = function(filePath, data) {

    if (fs.existsSync(filePath)) {
      return Promise.reject({
        statusCode: 400,
        message: 'File already exists'
      });
    }

    return fs.outputFile(filePath, yaml.safeDump(data));

  };

};
