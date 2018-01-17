/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/utilities/sync/media/index.js
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
const _ = require('lodash');

module.exports = function(util, parameters) {

  if (!parameters.options.media) {
    return;
  }

  var services = util.locals.services;
  var configStorage = services.get('storage');
  var foundObjects = {};
  var foundFolders = {};

  //-----------------------------------------------------

  var mediaBucket = configStorage.buckets.media;

  var shared = {
    services: services,
    foundObjects: foundObjects,
    foundFolders: foundFolders,
    util: util
  };

  return Promise.resolve()
    .then(function() {
      if (!parameters.media.private) {
        return;
      }

      return init(_.extend({
        bucket: mediaBucket.private,
        model: services.models.Media_Private
      },shared));

    })
    .then(function() {

      if(!parameters.media.public) {
        return;
      }

      return init(_.extend({
        bucket: mediaBucket.staging,
        model: services.models.Media
      },shared));

    });

  //-----------------------------------------------------


  function init(options){

    return Promise.resolve()
      .then(function() {

        if(!parameters.process.source){
          return;
        }

        return Promise.resolve()
          .then(function() {
            return updateAllKeys(options);
          })
          .then(function() {
            return createMissingFolders(options);
          })
          .then(function() {
            return deleteUnused(options);
          })
          .then(function() {
            return deleteEmptyFolders(options);
          });

      })
      .then(function() {

        if (!parameters.process.search) {
          return;
        }

        return require('./search')(util,options);

      })
      .then(function() {
        util.log('Sync is complete');
      });

  }

};
