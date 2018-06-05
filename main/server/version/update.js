/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: main/server/version/update.js
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

const Promise = require('bluebird');
module.exports = function(app) {

  var config = app.config;

  app.version.update = function() {

    var branch = process.env.GIT_BRANCH || `agneta-${process.env.MODE}`;

    return Promise.resolve()
      .then(function() {
        return app.git.checkoutLocalBranch(branch);
      })
      .then(function() {
        console.log(`Fetching from remote ${config.remote.name} with branch ${branch}`);
        return app.git.fetch(config.remote.name, branch);
      })
      .then(function() {
        return app.git.reset(['--hard', 'FETCH_HEAD']);
      })
      .then(function() {
        return app.git.clean('f', ['-d']);
      });

  };
};
