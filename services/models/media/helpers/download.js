/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/models/media/helpers/download.js
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
const path = require('path');

module.exports = function(Model, app) {

  var bucket = app.get('storage').buckets.media;

  Model.__download = function(location,req) {

    location = path.normalize(location);
    location = app.helpers.normalizePath(location);

    var item;

    return Promise.resolve()
      .then(function() {

        //return app.storage.headObject(params);
        return Model.findOne({
          where: {
            location: location
          }
        });

      })
      .then(function(_item) {

        item = _item;

        if (!item) {
          return Promise.reject({
            message: 'Media file could not be found'
          });
        }

        var roles = ['administrator', 'editor'];

        if (item.roles) {
          roles = roles.concat(item.roles);
        }

        return app.models.Account.hasRoles(
          roles,
          req
        );

      })
      .then(function(result) {
        if (!result.has) {
          //console.log(result);
          return Promise.reject({
            status: '401',
            message: 'You are not authorized to access this media object'
          });
        }
      })
      .then(function() {

        item.stream = app.storage.getObjectStream({
          Bucket: bucket.private,
          Key: location
        });

        return item;

      });

  };
};
