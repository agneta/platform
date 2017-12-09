/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/server/boot/git/init.js
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
const _ = require('lodash');
const fs = require('fs-extra');
const path = require('path');

module.exports = function(app) {

  var base_dir = process.cwd();
  var config = app.config;

  app.git = simplegit(base_dir);

  app.git.outputHandler(function(command, stdout, stderr) {
    stdout.pipe(process.stdout);
    stderr.pipe(process.stderr);
  });

  return Promise.resolve()
    .then(function() {
      return fs.exists(
        path.join(base_dir, '.git')
      );
    })
    .then(function(exists) {
      if (!exists) {
        throw new Error('You must setup your git repository');
      }
    })
    .then(function() {
      return app.git.getRemotes();
    })
    .then(function(remotes) {

      var foundRemote = _.find(remotes, {
        name: config.remote.name
      });

      if (!foundRemote) {

        if (config.remote.name && config.remote.url) {
          return app.git.addRemote(config.remote.name, config.remote.url);
        }
      }

    })
    .then(function() {
      return app.git.branch();
    })
    .then(function(result) {
      if (!result.current.length) {
        return app.version.update()
          .then(function() {
            return app.git.branch();
          });
      }
      return result;
    })
    .then(function(result) {

      console.log('branch', result);
      app.git.branch = result;

    });

};
