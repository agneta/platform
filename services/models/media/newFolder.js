/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/models/media/newFolder.js
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

module.exports = function(Model) {

  Model.newFolder = function(name, dir) {

    var location = Model.__getMediaPath(dir, name);

    return Model.findOrCreate({
      where: {
        location: location
      },
      fields: {
        id: true
      }
    }, {
      location: location,
      type: 'folder'
    })
      .then(function(result){
        return result[0];
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
