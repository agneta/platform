/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/server/remotes/media/newFolder.js
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

  Model.newFolder = function(name, dir) {

    var location = Model.__getMediaPath(dir, name);

    return Model.findOne({
      where: {
        location: location
      },
      fields: {
        id: true
      }
    })
      .then(function(res) {
        console.log('newFolder:Model.findOne:res',res);
        if (res) {
          return Promise.reject({
            statusCode: 400,
            message: 'Object already exists with that name'
          });
        }
        return Model.create({
          location: location,
          type: 'folder'
        });
      });

  };

  Model.remoteMethod(
    'newFolder', {
      description: 'Upload a file',
      accepts: [{
        arg: 'name',
        type: 'string',
        required: true
      }, {
        arg: 'dir',
        type: 'string',
        required: false
      }],
      returns: {
        arg: 'result',
        type: 'object',
        root: true
      },
      http: {
        verb: 'post',
        path: '/new-folder'
      }
    }
  );

};
