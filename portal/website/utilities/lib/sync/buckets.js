/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/utilities/lib/sync/buckets.js
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
var prettyBytes = require('pretty-bytes');
var Promise = require('bluebird');

module.exports = function(util) {

  var services = util.locals.services;
  var storage = services.storage;

  function sync(options) {

    var bucketTarget = options.target;
    var bucketSource = options.source;

    var filesTarget = [];
    var filesTargetDict = {};
    var filesSource = [];
    var filesCopied = [];
    var filesSkipped = [];

    return storage.listAllObjects({
      bucket: bucketSource,
      onData: function(files) {
        filesSource = filesSource.concat(files);
      }
    })
      .then(function() {
        var totalSize = 0;
        return Promise.map(filesSource, function(fileDest) {
          totalSize += fileDest.Size;
        })
          .then(function() {
            return totalSize;
          });
      })
      .then(function(totalSize) {

        util.log('------------------------------------------');
        util.log('Source Bucket:', bucketSource);
        util.log('Source Objects:', filesSource.length);
        util.log('Source Total Size:', prettyBytes(totalSize));
        util.log('------------------------------------------');

        return storage.listAllObjects({
          bucket: bucketTarget,
          onData: function(files) {
            filesTarget = filesTarget.concat(files);
          }
        });
      })
      .then(function() {
        var totalSize = 0;
        return Promise.map(filesTarget, function(file, index) {
          filesTargetDict[file.Key] = index;
          totalSize += file.Size;
        })
          .then(function() {
            return totalSize;
          });
      })
      .then(function(totalSize) {

        util.log('------------------------------------------');
        util.log('Target Bucket:', bucketTarget);
        util.log('Target Objects:', filesTarget.length);
        util.log('Target Total Size:', prettyBytes(totalSize));
        util.log('------------------------------------------');

        var bar = util.progress(filesSource.length, {
          title: 'Copy Objects to bucket: ' + bucketTarget
        });

        return Promise.map(filesSource, function(file) {
          return Promise.resolve()
            .delay(20)
            .then(function() {
              var fileTarget = filesTargetDict[file.Key];
              if (fileTarget) {
                fileTarget = filesTarget[fileTarget];
                //console.log(file.ETag,fileTarget.ETag);
                if (file.Size == fileTarget.Size) {
                  filesSkipped.push(file.Key);
                  return;
                }
              }

              var keyEncoded = encodeURI(file.Key);

              return storage.copyObject({
                Bucket: bucketTarget,
                CopySource: bucketSource + '/' + keyEncoded,
                Key: file.Key,
                /*
                                Metadata: {
                                  Checksum: file.Metadata.Checksum
                                }*/
              }).
                then(function() {
                  filesCopied.push(file.Key);
                });
            })
            .then(function() {
              bar.tick({
                title: file.Key
              });
            });
        }, {
          concurrency: 20
        });
      })
      .then(function() {
        util.success(
          `Deployment to ${bucketTarget} successful` +
                    `\nFiles Copied: ${filesCopied.length}` +
                    `\nFiles Skipped: ${filesSkipped.length}`
        );
      });

  }

  return sync;
};
