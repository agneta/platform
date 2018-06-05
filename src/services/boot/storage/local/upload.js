const Promise = require('bluebird');
const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');

module.exports = function(data) {

  return function(options){
    var target = path.join(data.root, options.Bucket, options.Key);
    var targetFile = `${target}.file`;
    var ETag;
    return Promise.resolve()
      .then(function() {
        return fs.pathExists(targetFile)
          .then(function(exists) {
            if(!exists){
              return;
            }
            return fs.remove(targetFile);
          });
      })
      .then(function() {
        return fs.ensureFile(targetFile);
      })
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
            const file = fs.createWriteStream(targetFile);
            file.on('finish', resolve);
            file.on('error', reject);
            options.Body.pipe(file);
          });

        return Promise.all([promiseHash, promiseOutput]);

      })
      .then(function() {
        return fs.stat(targetFile);
      })
      .then(function(stats) {

        return fs.outputJson(`${target}.json`, {
          ContentType: options.ContentType,
          ContentLength: stats.size,
          ContentEncoding: options.ContentEncoding,
          LastModified: new Date(),
          ETag: ETag
        });
      });

  };
};
