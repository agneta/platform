/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/middleware/media-private.js
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

module.exports = function(app) {

  var client = app.get('options').client;
  var clientProject = client.project;

  var basePath = '/' + clientProject.config.media.base + '/';

  return function(req, res, next) {

    var remotePath = req.path;

    if (remotePath.indexOf(basePath) !== 0) {
      return next();
    }

    remotePath = remotePath.substring(basePath.length);

    return app.models.Media_Private.__download(remotePath,req)
      .then(function(item) {

        var ext = mime.extension(item.contentType);
        var filename = item.name + '.' + ext;

        res.set('Content-Type', item.contentType);
        res.set('Last-Modified', item.updatedAt);
        res.set('Content-Disposition', `filename="${filename}"`);

        item.stream
          .on('error', function(err) {
            next(err);
          }).pipe(res);

      })
      .catch(next);
  };
};
