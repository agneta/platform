/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/boot/git/log.js
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

  var config = app.web.services.get('git');

  app.git.log = function(options) {

    var filePath;
    if (options.file) {
      filePath = app.git.getPath(options.file);
    }

    return app.git.native.log({
      file: filePath
    })
      .then(function(result) {

        var authorConfig = config.authors || {};

        return Promise.map(result.all, function(commit) {
          var author = authorConfig[commit.author_email];
          if (author) {

            var map = author.map;
            if (map) {
              commit.author_email = map.email;
              commit.author_name = map.name;
            }
          }
          commit.date = new Date(commit.date).toISOString();
          return commit;

        });
      });
  };

};
