/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/models/media/uploadFile.js
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

module.exports = function(Model) {


  Model.uploadFile = function(req) {

    //console.log('about to prepare file', data);
    Model.__uploadFile({
      req: req,
      field: 'object'
    })
      .then(function(object){
        Model.io.emit('file:upload:complete',object);
      });

    return Promise.resolve({
      _success: 'File is uploading'
    });

  };

  Model.remoteMethod(
    'uploadFile', {
      description: 'Upload a single file',
      accepts: [{
        arg: 'req',
        type: 'object',
        'http': {
          source: 'req'
        }
      }],
      returns: {
        arg: 'result',
        type: 'object',
        root: true
      },
      http: {
        verb: 'post',
        path: '/upload-file'
      }
    }
  );

};
