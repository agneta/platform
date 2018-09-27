/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/middleware/page-private/deployed.js
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
const fs = require('fs-extra');
const request = require('request-promise');
const cachedRequest = require('cached-request')(request);
const path = require('path');
const _ = require('lodash');
const stream = require('stream');
const Promise = require('bluebird');

module.exports = function(app) {
  var config = app.web.services.get('storage');
  var project = app.web.project;
  var bucket = config.buckets.pages.host;
  var cacheDirectory = path.join(project.paths.core.cache, 'private-pages');
  var ttl = 5 * 60 * 1000;

  var normalizeOptions = cachedRequest.getValue('normalizeOptions');
  var hashKey = cachedRequest.getValue('hashKey');

  return function(data) {
    var key = urljoin(data.remotePath, 'index.html');
    var options = {
      url: key
    };

    var cacheKey = JSON.stringify(normalizeOptions(options));
    cacheKey = hashKey(cacheKey);

    var cachedFilePath = path.join(cacheDirectory, cacheKey + '');
    var headersPath = path.join(cacheDirectory, cacheKey + '.json');

    var params = {
      Bucket: bucket,
      Key: key
    };

    return Promise.resolve()
      .then(function() {
        return fs.pathExists(headersPath).then(function(exists) {
          console.log('headersPath exist', exists);

          if (!exists) {
            return false;
          }
          return fs.pathExists(cachedFilePath);
        });
      })
      .then(function(exists) {
        console.log('cachedFilePath exist', exists);

        if (!exists) {
          return false;
        }
        return fs.stat(headersPath).then(function(stats) {
          if (stats.mtime.getTime() + ttl < Date.now()) {
            return false;
          }
          return fs.readJson(headersPath).then(function(headers) {
            for (var key in headers) {
              let value = headers[key];
              data.res.set(key, value);
            }
            fs.createReadStream(cachedFilePath).pipe(data.res);
            return true;
          });
        });
      })
      .then(function(sent) {
        if (sent) {
          return;
        }

        return app.storage
          .headObject({
            Bucket: bucket,
            Key: key
          })
          .then(function(storageObjectHead) {
            var headers = _.zipObject(
              [
                'content-encoding',
                'content-type',
                'content-length',
                'last-modified'
              ],
              _.values(
                _.pick(storageObjectHead, [
                  'ContentEncoding',
                  'ContentType',
                  'ContentLength',
                  'LastModified'
                ])
              )
            );

            for (var key in headers) {
              let value = headers[key];
              data.res.set(key, value);
            }

            return fs.outputFile(headersPath, JSON.stringify(headers));
          })
          .then(function() {
            return fs.remove(cachedFilePath);
          })
          .then(function() {
            return fs.ensureFile(cachedFilePath);
          })
          .then(function() {
            var responseWriter = fs.createWriteStream(cachedFilePath);

            var readableStream = app.storage
              .getObjectStream(params)
              .on('error', function(err) {
                data.next(err);
              });

            readableStream = readableStream.pipe(new stream.PassThrough());
            readableStream.pipe(data.res);

            readableStream = readableStream.pipe(new stream.PassThrough());
            readableStream.pipe(responseWriter);

            return readableStream;
          });
      })
      .catch(function(err) {
        data.next(err);
      });
  };
};
