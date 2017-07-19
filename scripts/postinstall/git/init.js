/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: hooks/preinstall/git/init.js
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
var nodegit = require('nodegit');
var path = require('path');
var fs = require('fs-extra');
const simplegit = require('simple-git/promise');

module.exports = function(app) {

  var config = app.get('git');

  if (!config) {
    throw new Error('You must have your git configurations');
  }

  if (!config.remote) {
    throw new Error('You must have your git remote configurations');
  }

  if (!config.remote.url) {
    throw new Error('You must have your git remote url');
  }

  var base_dir = process.cwd();
  var repoPath = path.join(base_dir, app.git.name);
  var repo;
  var initiated;

  app.git.native = simplegit(base_dir);

  var promise = Promise.resolve()
    .then(function() {
      if (!fs.existsSync(repoPath)) {
        return nodegit.Repository.init(repoPath, 0)
          .then(function() {
            return true;
          });
      }
    })
    .then(function(_initiated) {

      initiated = _initiated;

      return nodegit.Repository.open(repoPath)
        .then(function(repository) {

          repo = repository;
          app.git.repository = repository;
          return repo.getRemotes();

        });
    })
    .then(function(remotes) {

      var foundRemote = remotes.indexOf(config.remote.name) >= 0;

      if (foundRemote) {
        return repo.getRemote(config.remote.name);
      } else {
        return nodegit.Remote.create(repo, config.remote.name, config.remote.url);
      }

    })
    .then(function(remote) {
      app.git.remote = remote;
      if (initiated) {
        return app.git.update();
      }
    })
    .then(function() {
      return repo.getCurrentBranch();
    })
    .then(function(reference) {
      app.git.branch = reference;
    })
    .then(function() {

      console.log('Git repository is ready');
      console.log('Current branch is', app.git.branch.name());
      return;

      // Testing
      var filePath = path.join(base_dir, 'website/source/pages/home.yml');
      return app.git.log({
        file: filePath
      })
        .then(function(log) {
          console.log(log);

          return app.git.readFile({
            file: filePath,
            commit: 'bd4e1dfe140299e698d771b2da189b54f5da7206'
          });
        })
        .then(console.log);

    });

  promise.done();
  return promise;

};
