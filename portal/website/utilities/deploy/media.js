/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/utilities/deploy/media.js
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
const SyncBuckets = require('../lib/sync/buckets');

module.exports = function(util) {

  var services = util.locals.services;
  var syncBuckets = SyncBuckets(util);
  var storageConfig = services.get('storage');

  return function(options) {

    if (!options.source.media) {
      return;
    }

    util.log('Deploying media...');
    switch (options.target) {
      case 'production':
        return syncBuckets({
          source: storageConfig.buckets.media.name,
          target: storageConfig.buckets.media.production
        });
    }
  };
};
