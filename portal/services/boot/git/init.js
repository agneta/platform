/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/boot/git/init.js
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
const simplegit = require('simple-git/promise');

module.exports = function(app) {

    var base_dir = process.cwd();
    var repoPath = path.join(base_dir, app.git.name);
    var config = app.get('git');

    app.git.native = simplegit(base_dir);

    return Promise.resolve()
        .then(function() {
            return nodegit.Repository.open(repoPath);
        })
        .then(function(repository) {
            app.git.repository = repository;
            return app.git.repository.getRemote(config.remote.name);

        })
        .then(function(remote) {
            app.git.remote = remote;
            return app.git.repository.getCurrentBranch();

        })
        .then(function(reference) {
            app.git.branch = reference;
        });

};
