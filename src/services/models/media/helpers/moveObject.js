/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/models/media/helpers/moveObject.js
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

module.exports = function(Model, app) {

  Model.__moveObject = function(operation) {
    var object;
    //console.log('__moveObject',operation);

    operation.source = app.helpers.normalizePath(operation.source);
    operation.target = app.helpers.normalizePath(operation.target);

    if (operation.source == operation.target) {
      return Promise.reject({
        statusCode: 400,
        message: 'Cannot move to self'
      });
    }

    return Model.__copyObject(operation)
      .then(function(_object) {

        object = _object;

        if(!object){
          return Promise.reject({
            statusCode: 400,
            message: `Did not successfully copy the object. From: ${operation.source} to: ${operation.target}`
          });
        }

        return app.storage.deleteObject({
          Bucket: Model.__bucket,
          Key: operation.source
        });

      })
      .then(function() {
        return operation.object.destroy();
      })
      .then(function() {
        return object;
      });
  };
};
