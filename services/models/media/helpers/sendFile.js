/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/models/media/helpers/sendFile.js
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
const stream = require('stream');
const path = require('path');
const mime = require('mime-types');

module.exports = function(Model, app) {

  function emit(name, data) {
    if (!Model.io) {
      return;
    }
    Model.io.emit(name, data);
  }

  Model.__sendFile = function(file) {

    file.stream.setMaxListeners(20);

    var fileStream = new stream.PassThrough();
    fileStream = file.stream.pipe(fileStream);

    var ext = mime.extension(file.mimetype);
    var filename = path.parse(file.location).name + '.' + ext;

    var totalProgress = {};
    var operations = [];
    var type = file.type || app.helpers.mediaType(file.mimetype);
    var options = {
      file: file.stream,
      filename: filename,
      location: file.location,
      type: type,
      mimetype: file.mimetype,
      size: file.size,
      onProgress: function(progress){

        totalProgress[progress.location] = progress;
        var totalPercentage = 0;
        for(var key in totalProgress){
          totalPercentage += totalProgress[key].percentage;
        }
        //console.log('totalPercentage',totalPercentage);

        totalPercentage /= operations.length;
        //console.log('totalPercentage /= operations.length',operations.length,totalPercentage);


        emit('file:operation:progress', {
          location: file.location,
          percentage: totalPercentage
        });

        if(totalPercentage==100){
          emit('file:operation:complete', {
            location: file.location
          });
        }
      }
    };

    operations.push(_.extend({}, options, {
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


    operations = _.map(operations, function(operation, index) {

      if (operation.then) {
        return operation.then(function(options) {
          options.index = index;
          return Model.__initOperation(options);
        });
      }
      operation.index = index;
      return Model.__initOperation(operation);

    });

    //console.log('operations', operations.length);

    return Promise.all(operations)
      .then(function() {

        Model.__checkFolders({
          dir: path.parse(file.location).dir
        })
          .catch(function(err) {
            console.error('Checking folder error');
            console.error(err);
          });

        var object = {
          location: file.location,
          type: file.type,
          size: file.size,
          contentType: file.mimetype
        };
        return object;

      });

  };
};
