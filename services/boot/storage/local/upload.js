const Promise = require('bluebird');
const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');

module.exports = function(data) {

  return function(options){
    var target = path.join(data.root, options.Bucket, options.Key);
    var ETag;

    return Promise.resolve()
      .then(function() {
        return fs.remove(target);
      })
      .then(function() {
        return fs.ensureFile(target);
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
      });

  };
};
