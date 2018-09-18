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
const simplegit = require('simple-git/promise');
const Promise = require('bluebird');
const path = require('path');
const _ = require('lodash');
const config = require('./config');

module.exports = function() {
  var base_dir = process.cwd();

  var git = {
    name: '.git',
    native: simplegit(base_dir)
  };

  var repoPath = path.join(base_dir, git.name);

  git.native.outputHandler(function(command, stdout, stderr) {
    stdout.pipe(process.stdout);
    stderr.pipe(process.stderr);
  });

  return Promise.resolve()
    .then(function() {
      git.native.checkIsRepo().then(function(isRepo) {
        if (isRepo) {
          return;
        }
        return git.native.init(repoPath, 0);
      });
    })
    .then(function() {
      return git.native.getRemotes();
    })
    .then(function(remotes) {
      var remote = _.find(remotes, { name: config.remote.name });
      if (remote) {
        return;
      }
      return git.native.addRemote(config.remote.name, config.remote.url);
    })
    .then(function() {
      console.log(`Fetching changes from remote ${config.remote.name}`);
      return git.native.fetch(config.remote.name, 'master');
    })
    .then(function() {
      console.log('Git repository is ready');
    });
};
