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
const _ = require('lodash');

module.exports = function(app) {

  var base_dir = process.cwd();
  var config = app.get('git');
  app.git.native = simplegit(base_dir);

  return app.git.native.getRemotes()
    .then(function(remotes) {

      var foundRemote = _.find(remotes, {
        name: config.remote.name
      });

      if (!foundRemote) {
        return app.git.native.addRemote(config.remote.name, config.remote.url);
      }

    })
    .then(function() {
      return app.git.native.branch();
    })
    .then(function(result) {

      //console.log('branch', result);
      app.git.branch = result;

      return app.models.GIT.fetch();

    });

};
