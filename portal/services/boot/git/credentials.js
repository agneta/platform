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
const path = require('path');

module.exports = function(app) {

    var base_dir = process.cwd();

    var sshDir = path.join(base_dir, 'ssh');
    var sshPublicKey = path.join(sshDir, "id_rsa.pub");
    var sshPrivateKey = path.join(sshDir, "id_rsa");

    app.git.credentials = function(url, username) {
        return nodegit.Cred.sshKeyNew(username, sshPublicKey, sshPrivateKey, '');
    };

};
