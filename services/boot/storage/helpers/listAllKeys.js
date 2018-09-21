const Promise = require('bluebird');

module.exports = function(app) {
  app.storage.listAllObjects = function(options) {
    var promises = [];

    function listAllKeys(marker) {
      return app.storage
        .listObjects({
          Bucket: options.bucket,
          ContinuationToken: marker
        })
        .then(function(data) {
          var promise = options.onData(data.Contents) || Promise.resolve();
          promises.push(promise);

          if (data.IsTruncated) {
            return listAllKeys(data.NextContinuationToken);
          }
        });
    }

    return listAllKeys().then(function() {
      return Promise.all(promises);
    });
  };
};
