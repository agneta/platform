/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/server/middleware/media-private.js
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
const mime = require('mime-types');
const path = require('path');
const Promise = require('bluebird');

module.exports = function(app) {

  var client = app.get('options').client;
  var clientProject = client.project;

  var basePath = '/' + clientProject.config.media.base + '/';
  var bucket = app.get('storage').buckets.media;

  return function(req, res, next) {

    var remotePath = req.path;
    var Media_Private = app.models.Media_Private;

    if (remotePath.indexOf(basePath) !== 0) {
      return next();
    }

    remotePath = remotePath.substring(basePath.length);
    remotePath = path.normalize(remotePath);
    remotePath = Media_Private.__fixPath(remotePath);

    var params = {
      Bucket: bucket.private,
      Key: remotePath
    };

    var item;

    return Promise.resolve()
      .then(function() {

        //return app.storage.headObject(params);
        return Media_Private.findOne({
          where: {
            location: remotePath
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
            message: 'You are not authorized to access this media object'
          });
        }
      })
      .then(function() {

        var ext = mime.extension(item.contentType);
        var filename = item.name + '.' + ext;

        res.set('Content-Type', item.contentType);
        res.set('Last-Modified', item.updatedAt);
        res.set('Content-Disposition', `filename="${filename}"`);

        app.storage.getObjectStream(params)
          .on('error', function(err) {
            next(err);
          }).pipe(res);

      })
      .catch(next);
  };
};
