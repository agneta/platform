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
const fs = require('fs-extra');
const Promise = require('bluebird');
const path = require('path');

module.exports = function(app) {

  var config = app.get('git');
  var base_dir = process.cwd();

  app.git = {
    name: '.git',
    native: simplegit(base_dir)
  };

  var repoPath = path.join(base_dir, app.git.name);
  var initiated;

  app.git.native.outputHandler(function(command, stdout, stderr) {
    stdout.pipe(process.stdout);
    stderr.pipe(process.stderr);
  });

  app.git.init = function() {

    return Promise.resolve()
      .then(function() {
        if (!fs.existsSync(repoPath)) {
          return app.git.native.init(repoPath, 0)
            .then(function() {
              return true;
            });
        }
      })
      .then(function(_initiated) {

        initiated = _initiated;
        return app.git.native.getRemotes();

      })
      .then(function(remotes) {

        console.log(remotes);
        var foundRemote = remotes.indexOf(config.remote.name) >= 0;

        if (!foundRemote) {
          return app.git.native.addRemote(config.remote.name, config.remote.url);
        }

      })
      .then(function() {
        return simplegit.branch();
      })
      .then(function(reference) {
        app.git.branch = reference;

        return {
          initiated: initiated
        };

      });

  };

};
