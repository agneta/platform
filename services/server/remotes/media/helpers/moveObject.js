/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/server/remotes/media/helpers/moveObject.js
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
const urljoin = require('url-join');
const Promise = require('bluebird');

module.exports = function(Model, app) {

  Model.__moveObject = function(operation) {
    return app.storage.s3.copyObjectAsync({
      Bucket: Model.__bucket.name,
      CopySource: urljoin(Model.__bucket.name, operation.source),
      Key: operation.target,
      ContentType: operation.contentType
    })
      .catch(function(err) {
        if (err.message.indexOf('This copy request is illegal because it is trying to copy an object to itself') === 0) {
          return;
        }
        if (err.message.indexOf('The specified key does not exist') === 0) {
          return;
        }
        console.error(operation);
        return Promise.reject(err);
      })
      .then(function() {
        if (operation.source == operation.target) {
          return;
        }
        return app.storage.s3.deleteObjectAsync({
          Bucket: Model.__bucket.name,
          Key: operation.source
        });
      });
  };
};
