/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/server/remotes/media/helpers/sendFile.js
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
var uuidV1 = require('uuid/v1');
const stream = require('stream');

module.exports = function(Model) {

  Model.__sendFile = function(file) {

    var uuid = uuidV1();

    file.stream.setMaxListeners(20);

    Model.io.emit('file:upload:created', {
      id: uuid
    });

    var fileStream = new stream.PassThrough();
    fileStream = file.stream.pipe(fileStream);

    var operations = [];
    var options = {
      id: uuid,
      file: file.stream,
      location: file.location,
      type: file.type,
      mimetype: file.mimetype,
      size: file.size,
    };

    operations.push(_.extend({},options,{
      file: fileStream
    }));

    switch (file.type) {
      case 'pdf':
      //TODO: Make PDF preview images
        break;
      case 'image':
        Model.__images.onUpload(options, operations);
        break;
    }

    var operationProgress = [];
    _.map(operations, function() {
      operationProgress.push(0);
    });

    function onProgress(progress) {
      operationProgress[progress.index] = progress.percentage;

      var percentage = _.reduce(operationProgress, function(sum, n) {
        return sum + n;
      }, 0);
      percentage /= operationProgress.length;
      Model.io.emit('file:upload:progress', {
        percentage: (percentage * 100).toFixed(2) / 1
      });
    }

    function prepareOperation(options) {
      options.onProgress = onProgress;
      return Model.__initOperation(options);
    }

    operations = _.map(operations, function(operation, index) {

      if (operation.then) {
        return operation.then(function(options) {
          options.index = index;
          return prepareOperation(options);
        });
      }
      operation.index = index;
      return prepareOperation(operation);

    });

    //console.log('operations', operations.length);

    return Promise.all(operations)
      .then(function() {
        return Model.__checkFolders({
          dir: file.dir
        });
      })
      .then(function() {
        Model.io.emit('file:upload:progress', {
          percentage: 100
        });

        return {
          id: options.objectId,
          location: file.location,
          type: file.type,
          dir: file.dir,
          size: file.size,
          contentType: file.mimetype
        };

      })
      .catch(function(err) {
        console.error('File Upload error');
        console.error(err);
      });

  };
};
