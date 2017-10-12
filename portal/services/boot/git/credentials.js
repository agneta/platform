/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/boot/git/credentials.js
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
const nodegit = require('nodegit');
const Promise = require('bluebird');

module.exports = function(app) {

  return Promise.resolve()
    .then(function() {

      if (!process.env.GIT_PUB || !process.env.GIT_PUB) {
        throw new Error('Git must have SSH credentials');
      }

      var sshPublicKey = process.env.GIT_PUB;
      var sshPrivateKey = process.env.GIT_KEY.replace(/\\n/g,'\n');

      app.git.credentials = function(url, username) {
        return nodegit.Cred.sshKeyMemoryNew(username, sshPublicKey, sshPrivateKey, '');
      };

    });

};
