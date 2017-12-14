/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/boot/storage/local.js
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
const crypto = require('crypto');
const _ = require('lodash');

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
          var check;
          var items = 0;

          return new Promise(function(resolve, reject) {

            walker.on('data', function(item) {

              if (!item.stats.isFile()) {
                return;
              }
              if (item.path.indexOf('meta.json') > 0) {
                return;
              }
              items++;
              Promise.resolve()
                .then(function() {
                  return getItem({
                    item: item,
                    dir: dir
                  });
                })
                .then(function(item) {
                  result.push(item);
                  if (!check) {
                    return;
                  }
                  if (items == result.length) {
                    resolve();
                  }
                })
                .catch(reject);
            });

            walker.on('end', function() {
              check = true;
            });
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
      var ETag;

      return Promise.resolve()
        .then(function() {

          var promiseHash = new Promise(function(resolve, reject) {

            var output = crypto.createHash('md5');
            output.once('readable', function() {
              resolve(output.read().toString('hex'));
            });
            options.Body.on('error', reject);
            options.Body.pipe(output);
          })
            .then(function(hash) {
              ETag = hash;
            });

          var promiseOutput = new Promise(
            function(resolve, reject) {
              const file = fs.createWriteStream(target);
              file.on('finish', resolve);
              file.on('error', reject);
              options.Body.pipe(file);
            });

          return Promise.all([promiseHash, promiseOutput]);

        })
        .then(function() {

          return fs.outputJson(`${target}.meta.json`, {
            ContentType: options.ContentType,
            ContentEncoding: options.ContentEncoding,
            ETag: ETag
          });
        })
        .then(function() {
          return fs.ensureFile(target);
        })
        .then(function() {

        });

    },

  };

  function getItem(options) {
    return Promise.resolve()
      .then(function() {
        return fs.readJson(`${options.item.path}.meta.json`);
      })
      .then(function(meta) {
        meta.ETag = `"${meta.ETag}"`;
        return _.extend(meta, {
          Key: path.relative(options.dir, options.item.path),
          Size: options.item.stats.size
        });
      });
  }

};
