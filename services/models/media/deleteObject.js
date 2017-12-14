/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/models/media/deleteObject.js
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

module.exports = function(Model, app) {

  Model.deleteObject = function(location) {

    var file;
    var files;

    return Model.findOne({
      where: {
        location: location
      }
    })
      .then(function(_file) {

        file = _file;

        if (!file) {
          return Promise.reject({
            message: 'No file found at: ' + location
          });
        }

        files = [{
          Key: location
        }];

        if (file.type == 'folder') {
          return Model._list(file.location)
            .then(function(result) {
              return Promise.map(result.objects, function(object) {
                //console.log('delete folder object:', object.name);
                return Model.deleteObject(object.location);
              }, {
                concurrency: 6
              });
            });
        }

        Model.__images.onDelete({
          file: file,
          files: files,
          location: location
        });

      })
      .then(function() {

        return app.storage.deleteObjects({
          Bucket: Model.__bucket.name,
          Delete: {
            Objects: files
          }
        });

      })
      .then(function() {

        return file.destroy();
      })
      .then(function() {
        return {
          _success: 'The file is deleted'
        };
      });
  };

  Model.remoteMethod(
    'deleteObject', {
      description: 'Delete an object',
      accepts: [{
        arg: 'location',
        type: 'string',
        required: true
      }],
      returns: {
        arg: 'result',
        type: 'object',
        root: true
      },
      http: {
        verb: 'post',
        path: '/delete-object'
      }
    });

};
