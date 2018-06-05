const _ = require('lodash');
const path = require('path');
const fs = require('fs-extra');
const klaw = require('klaw');

module.exports = function(data) {

  return function(options){
    var result = [];
    var dir = path.join(data.root, options.Bucket);

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

  };
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
