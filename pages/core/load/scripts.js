/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/core/load/scripts.js
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
const fs = require('fs-extra');
const Promise = require('bluebird');
const path = require('path');
const klaw = require('klaw');

module.exports = function(locals) {

  var project = locals.project;

  return function() {

    ////////////////////////////////////////////////////////
    // LOAD THEME SCRIPTS
    ////////////////////////////////////////////////////////

    var scriptDirs = [
      project.paths.app.scripts,
      project.paths.pages.scripts,
      project.paths.theme.scripts
    ];

    return Promise.map(scriptDirs, function(scriptDir) {

      fs.ensureDirSync(scriptDir);

      var walker = klaw(scriptDir, {
        followLinks: false
      });

      walker.on('data', function(item) {

        if (item.stats.isDirectory()) {
          return;
        }

        var path_parsed = path.parse(item.path);

        if (path_parsed.ext != '.js') {
          return;
        }

        require(item.path)(locals);
      });

      ////////////////////////////////////////////////////////
      // LOAD PROCESS PROJECT DATA - SETUP
      ////////////////////////////////////////////////////////


      return new Promise(function(resolve, reject) {

        walker.on('end', function() {
          resolve();
        });

        walker.on('error', reject);

      });
    });

  };
};
