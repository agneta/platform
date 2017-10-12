/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/boot/git/update.js
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

module.exports = function(app) {

  var config = app.get('git');

  app.git.update = function() {

    var references = app.git.branch.all;
    console.log('app.git.branch.all',references);

    return app.git.native.fetch(config.remote.name, config.branch)
      .then(function() {

        var branchName;

        return Promise.resolve()
          .then(function() {

            if (references.indexOf('refs/heads/master') >= 0) {

              branchName = app.git.branch.current;
              return;
            }

            branchName = 'master';
            return app.git.native.checkoutLocalBranch(branchName);

          })
          .then(function() {

            branchName = process.env.GIT_BRANCH || config.branch || branchName;
            if (branchName == 'master') {
              return;
            }
            return app.git.native.checkoutLocalBranch(branchName);

          });


      });


  };
};
