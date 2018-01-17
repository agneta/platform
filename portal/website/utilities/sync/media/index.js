/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/utilities/media/index.js
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

const Promise = require('bluebird');
const deleteUnused = require('./deleteUnused');
const deleteEmptyFolders = require('./deleteEmptyFolders');
const updateAllKeys = require('./updateAllKeys');
const createMissingFolders = require('./createMissingFolders');

module.exports = function(util, parameters) {

  var services = util.locals.services;
  var configStorage = services.get('storage');
  var Media;
  var bucket;
  var foundObjects = {};
  var foundFolders = {};

  //-----------------------------------------------------

  var mediaBucket = configStorage.buckets.media;

  if (parameters.options.private) {
    bucket = mediaBucket.private;
    Media = services.models.Media_Private;
  } else {
    bucket = mediaBucket.staging;
    Media = services.models.Media;
  }

  //-----------------------------------------------------

  var shared = {
    services: services,
    foundObjects: foundObjects,
    foundFolders: foundFolders,
    Media: Media,
    util: util,
    bucket: bucket
  };

  return Promise.resolve()
    .then(function() {
      return updateAllKeys(shared);
    })
    .then(function() {
      return createMissingFolders(shared);
    })
    .then(function() {
      return deleteUnused(shared);
    })
    .then(function() {
      return deleteEmptyFolders(shared);
    })
    .then(function() {

      if (!parameters.options.generateKeywords) {
        return;
      }

      return require('./search')(util, {
        model: Media
      });

    })
    .then(function() {
      util.log('Sync is complete');
    });
};
