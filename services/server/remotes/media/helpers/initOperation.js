/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/server/remotes/media/helpers/initOperation.js
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
const _ = require('lodash');

module.exports = function(Model, app) {

  Model.__initOperation = function(options) {

    var latestEmit = {
      steps: {}
    };

    return Promise.resolve()
      .then(function() {

        return app.storage.upload({
          Bucket: Model.__bucket.name,
          Key: options.location,
          ContentType: options.mimetype,
          Body: options.file,
          onProgress: function(progress) {

            var percentage = 0;

            if (options.size) {
              percentage = progress.loaded / options.size / 2 * 100;
            }

            _.extend(latestEmit, {
              uploadedSize: progress.loaded,
              fileSize: options.size,
              percentage: percentage,
              location: options.location
            });

            emit('file:operation:progress', latestEmit);

          }
        });

      })
      .then(function() {

        latestEmit.percentage = 50;
        latestEmit.steps.uploaded = true;
        emit('file:operation:progress', latestEmit);

        return Model.findOne({
          where: {
            location: options.location
          }
        });
      })
      .then(function(fileInstance) {

        latestEmit.percentage = 70;
        latestEmit.steps.searchedDatabase = true;
        emit('file:operation:progress', latestEmit);

        var fileProps = {
          location: options.location,
          isSize: options.isSize,
          size: latestEmit.uploadedSize,
          type: options.type,
          contentType: options.mimetype
        };

        console.log('media:initOperation:fileProps',fileProps);

        if (fileInstance) {
          //console.log('file update', fileProps);
          return fileInstance.updateAttributes(fileProps);
        } else {
          //console.log('file create', fileProps);
          return Model.create(fileProps);
        }
      })
      .then(function(dbObject) {

        latestEmit.percentage = 100;
        latestEmit.steps.updatedDatabase = true;
        emit('file:operation:complete', latestEmit);

        options.objectId = dbObject.id;
        return dbObject;
      });

  };

  function emit(name, data) {
    if (!Model.io) {
      return;
    }
    Model.io.emit(name, data);
  }
};
