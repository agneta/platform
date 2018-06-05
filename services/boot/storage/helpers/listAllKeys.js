const Promise = require('bluebird');
const _ = require('lodash');

module.exports = function(app){

  app.storage.listAllObjects = function(options) {

    var promises = [];

    function listAllKeys(marker) {
      return app.storage.listObjects({
        Bucket: options.bucket,
        Marker: marker
      })
        .then(function(data) {

          var promise = options.onData(data.Contents) || Promise.resolve();
          promises.push(promise);

          if (data.IsTruncated) {
            return listAllKeys(_.last(data.Contents)
              .Key);
          }
        });
    }

    return listAllKeys()
      .then(function() {
        return Promise.all(promises);
      });
  };

};
