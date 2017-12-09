/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/server/boot/git/update.js
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

  var config = app.get('git');

  app.git.update = function() {

    return Promise.resolve()
      .then(function() {
        return app.git.native.checkoutLocalBranch(config.branch);
      })
      .then(function() {
        console.log(`Fetching from remote ${config.remote.name} with branch ${config.branch}`);
        return app.git.native.fetch(config.remote.name, config.branch);
      })
      .then(function() {
        return app.git.reset(['--hard', 'FETCH_HEAD']);
      })
      .then(function() {
        return app.git.clean('f', ['-d']);
      });

  };
};
