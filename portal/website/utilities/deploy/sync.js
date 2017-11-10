/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/utilities/deploy/sync.js
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
const Sync = require('../lib/sync/files');
const SyncBuckets = require('../lib/sync/buckets');
const Promise = require('bluebird');
const path = require('path');

module.exports = function(util) {

  var webProject = util.locals.web.project;
  var services = util.locals.services;

  return function(options) {

    var sync = Sync(util);
    var syncBuckets = SyncBuckets(util);

    var storageConfig = services.get('storage');
    var operations = [];

    if (options.promote.lib) {

      operations.push({
        method: syncBuckets,
        options: {
          source: storageConfig.buckets.lib.name,
          target: storageConfig.buckets.lib.production
        }
      });

    }

    if (options.promote.media) {

      operations.push({
        method: syncBuckets,
        options: {
          source: storageConfig.buckets.media.name,
          target: storageConfig.buckets.media.production
        }
      });

    }

    if (options.promote.build) {

      operations.push({
        method: sync,
        options: {
          source: path.join(webProject.paths.build, 'production', 'public'),
          target: storageConfig.buckets.assets.production
        }
      });

      operations.push({
        method: sync,
        options: {
          source: path.join(webProject.paths.build, 'production', 'private'),
          target: storageConfig.buckets.app.production.private
        }
      });

    }

    if (options.stage.build) {

      operations.push({
        method: sync,
        options: {
          source: path.join(webProject.paths.build, 'staging', 'public'),
          target: storageConfig.buckets.assets.name
        }
      });

      operations.push({
        method: sync,
        options: {
          source: path.join(webProject.paths.build, 'staging', 'private'),
          target: storageConfig.buckets.app.private
        }
      });

    }

    return Promise.each(operations, function(operation) {
      return operation.method(
        operation.options
      );
    });

  };
};
