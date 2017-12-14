/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/utilities/deploy/pages/build.js
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
const Sync = require('../../lib/sync/files');
const path = require('path');

module.exports = function(util) {

  var webProject = util.locals.web.project;
  var services = util.locals.services;
  var sync = Sync(util);
  var storageConfig = services.get('storage');

  return {
    production: function() {

      return sync({
        source: path.join(webProject.paths.app.build, 'production', 'public'),
        target: storageConfig.buckets.assets.production
      })
        .then(function() {
          return sync({
            source: path.join(webProject.paths.app.build, 'production', 'private'),
            target: storageConfig.buckets.app.production.private
          });
        });

    },
    staging: function() {

      return sync({
        source: path.join(webProject.paths.app.build, 'staging', 'public'),
        target: storageConfig.buckets.assets.name
      })
        .then(function() {
          return sync({
            source: path.join(webProject.paths.app.build, 'staging', 'private'),
            target: storageConfig.buckets.app.private
          });

        });

    }
  };
};
