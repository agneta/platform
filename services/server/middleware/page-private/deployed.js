/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/server/middleware/page-private/deployed.js
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

module.exports = function(app) {

  var config = app.get('storage');
  var bucket = config.buckets.app;

  switch (app.get('env')) {
    case 'production':
      bucket = bucket.production.private;
      break;
    default:
      bucket = bucket.private;
  }

  return function(data) {

    var key = urljoin(data.remotePath, 'index.html');
    var params = {
      Bucket: bucket,
      Key: key
    };
    return app.storage.s3.headObjectAsync({
      Bucket: bucket,
      Key: key
    })
      .then(function(storageObjectHead) {

        data.res.set('Content-Encoding', storageObjectHead.ContentEncoding);
        data.res.set('Content-Type', storageObjectHead.ContentType);
        data.res.set('Content-Length', storageObjectHead.ContentLength);
        data.res.set('Last-Modified', storageObjectHead.LastModified);

        return app.storage.s3.getObject(params)
          .createReadStream()
          .on('error', function(err) {
            data.next(err);
          })
          .pipe(data.res);

      });

  };

};
