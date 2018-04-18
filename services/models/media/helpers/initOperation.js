/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/models/media/helpers/initOperation.js
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
const probe = require('probe-image-size');
const stream = require('stream');
module.exports = function(Model, app) {

  Model.__initOperation = function(options) {

    var latestEmit = {
      steps: {}
    };
    var fileInstance;
    var fileProps = {};

    return Promise.resolve()
      .then(function() {

        var promises = [];
        var fileStreamBase = options.file;

        (function() {

          if(options.type!='image'){
            return;
          }
          fileStreamBase = fileStreamBase.pipe(
            new stream.PassThrough()
          );
          var promise = probe(fileStreamBase)
            .then(function(size){
              //console.log(size);
              fileProps.image = {
                width: size.width,
                height: size.height
              };
            });

          promises.push(promise);
        })();

        (function() {

          fileStreamBase = fileStreamBase.pipe(
            new stream.PassThrough()
          );
          var promise = app.storage.upload({
            Bucket: Model.__bucket,
            Key: options.location,
            ContentType: options.mimetype,
            Body: fileStreamBase,
            onProgress: function(progress) {
              //console.log(progress);

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

              options.onProgress(latestEmit);

            }
          });

          promises.push(promise);

        })();

        return Promise.all(promises);
      })
      .then(function() {

        latestEmit.percentage = 50;
        latestEmit.steps.uploaded = true;
        options.onProgress(latestEmit);

        return Model.findOne({
          where: {
            location: options.location
          }
        });
      })
      .then(function(_fileInstance) {
        fileInstance = _fileInstance;

        latestEmit.percentage = 70;
        latestEmit.steps.searchedDatabase = true;
        options.onProgress(latestEmit);

        _.extend(fileProps,{
          location: options.location,
          isSize: options.isSize,
          size: latestEmit.uploadedSize,
          type: options.type,
          contentType: options.mimetype
        });

      })
      .then(function() {

        //console.log('media:initOperation:fileProps',fileProps);

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
        options.onProgress(latestEmit);

        options.objectId = dbObject.id;
        return dbObject;
      });

  };

};
