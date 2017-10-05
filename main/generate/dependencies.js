/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: main/generate/dependencies.js
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
const log = require('../log');
const terminal = require('../server/terminal');
const projectPaths = require('../paths').core;
const path = require('path');
const progress = require('../progress');

module.exports = function() {

  terminal()
    .then(function(servers) {
      var utilityPath = path.join(
        projectPaths.portalWebsite, 'utilities/dependencies'
      );

      require(utilityPath)({
        locals: servers.webPortal.locals,
        log: console.log,
        progress: progress
      })
        .run()
        .then(function() {
          log.success('Success!');
        });

    })
    .then(function() {
      log.success('Dependencies are loaded');
    });
};
