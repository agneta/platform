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
const _ = require('lodash');

module.exports = function(Model, app) {

  var bucket = app.web.services.get('storage').buckets.media;

  Model.__download = function(location,req) {

    location = path.normalize(location);
    location = app.helpers.normalizePath(location);

    var item;
    var accountId = _.get(req,'accessToken.userId');

    return Promise.resolve()
      .then(function() {

        //return app.storage.headObject(params);
        return Model.findOne({
          where: {
            location: location
          },
          fields:{
            contentType: true,
            location: true,
            roles: true,
            privacy: true,
            updatedAt: true
          }
        });

      })
      .then(function(_item) {

        item = _item;
        var privacy = item.privacy || {};

        if (!item) {
          return Promise.reject({
            message: 'Media file could not be found'
          });
        }
        //console.log(location,req.accessToken.userId);

        //----------------------------------------------------
        // Check by type

        switch (privacy.type) {
          case 'public':
            return;
        }

        //----------------------------------------------------
        // Check if account owner

        if(location.indexOf(`account/${accountId}/`)===0){
          return;
        }

        //----------------------------------------------------
        // Check by role

        var roles = ['administrator', 'editor']
          .concat(item.roles||[],privacy.roles||[]);

        return app.models.Account.hasRoles(
          roles,
          req
        )
          .then(function(result) {
            if (!result.has) {
              //console.log(result);
              return Promise.reject({
                status: '401',
                message: 'You are not authorized to access this media object'
              });
            }
          });

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
