/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/boot/git/push.js
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

  app.git.push = function(message, req) {

    var Account = app.models.Account;
    var commit;

    var git = app.git.native;
    var config = app.get('git');

    return git.status()
      .then(function(status) {

        if (!status.files.length) {
          return Promise.reject({
            statusCode: 400,
            message: 'No changes to commit'
          });
        }

        return git.add('./*');
      })
      .then(function() {

        return Account.findById(req.accessToken.userId);
      })
      .then(function(account) {
        //console.log(account, name);
        var name = account.name || account.username || account.email.split('@')[0];
        var email = account.email;

        git.addConfig('user.name', name);
        git.addConfig('user.email', email);

        return git.commit(message);

      })
      .then(function(result) {

        commit = result.commit;
        var branchName = app.git.branch.current;
        //console.log(config.remote.name, branchName);

        return app.git.native.push(config.remote.name,branchName);

      })
      .then(function() {
        return {
          commit: commit
        };
      });

  };
};
