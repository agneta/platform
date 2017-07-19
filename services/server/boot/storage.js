/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/server/boot/storage.js
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
var AWS = require('aws-sdk');

module.exports = function(app) {

  var config = app.get('storage');

  if (!config) {
    return;
  }

  AWS.config.update({
    accessKeyId: config.id,
    secretAccessKey: config.secret,
    region: config.region
  });

  var s3 = new AWS.S3();

  app.storage = {
    s3: s3
  };

  s3.listAllObjects = function(options) {

    var promises = [];

    function listAllKeys(marker) {
      return s3.listObjectsAsync({
        Bucket: options.bucket,
        Marker: marker
      })
        .then(function(data) {

          var promise = options.onData(data.Contents) || Promise.resolve();
          promises.push(promise);

          if (data.IsTruncated) {
            return listAllKeys(_.last(data.Contents)
              .Key);
          }
        });
    }

    return listAllKeys()
      .then(function() {
        return Promise.all(promises);
      });
  };

};
