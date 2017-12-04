/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/server/boot/storage/local.js
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
const klaw = require('klaw');
const Promise = require('bluebird');
const fs = require('fs-extra');
const path = require('path');

module.exports = function(app) {

  var webPrj = app.get('options').client.project;
  var root = path.join(webPrj.paths.storage.buckets);

  return {
    listObjects: function(options) {

      var result = [];
      var dir = path.join(root, options.Bucket);

      return Promise.resolve()
        .then(function() {
          return fs.ensureDir(dir);
        })
        .then(function() {

          var walker = klaw(dir);

          walker.on('data', function(item) {

            if (!item.stats.isFile()) {
              return;
            }
            result.push(getItem({
              item: item,
              dir: dir
            }));
          });

          return new Promise(function(resolve, reject) {
            walker.on('end', resolve);
            walker.on('error', reject);
          });

        })
        .then(function() {

          return {
            Contents: result
          };
        });

    },
    headObject: function() {},
    copyObject: function() {},
    deleteObjects: function() {},
    deleteObject: function() {},
    getObjectStream: function() {},
    upload: function(options) {

      var target = path.join(root, options.Bucket, options.Key);

      return Promise.resolve()
        .then(function() {
          return fs.outputJson(`${target}.meta.json`,{
            ContentType: options.ContentType,
            ContentEncoding: options.ContentEncoding
          });
        })
        .then(function() {
          return fs.ensureFile(target);
        })
        .then(function() {
          return new Promise(
            function(resolve, reject) {
              const file = fs.createWriteStream(target);
              file.on('finish', resolve);
              file.on('error', reject);
              options.Body.pipe(file);
            });
        });

    },

  };

  function getItem(options) {
    return {
      Key: path.relative(options.dir, options.item.path),
      Size: options.item.stats.size
    };
  }

};
