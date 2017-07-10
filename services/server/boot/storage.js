var pkgcloud = require('pkgcloud');
var Promise = require('bluebird');
var _ = require('lodash');

module.exports = function(app) {

    var config = app.get('storage');

    if (!config) {
        return;
    }

    client = pkgcloud.storage.createClient({
        provider: 'amazon',
        keyId: config.id,
        key: config.secret,
        region: config.region
    });


    app.storage = Promise.promisifyAll(client);
    var s3 = app.storage.s3 = Promise.promisifyAll(client.s3);

    s3.listAllObjects = function(options) {

        var promises = [];

        function listAllKeys(marker) {
            return s3.listObjectsAsync({
                    Bucket: options.bucket,
                    Marker: marker
                })
                .then(function(data) {

                    var promise = options.onData(data.Contents) || Promise.resolve();
                    promises.push(promise);

                    if (data.IsTruncated) {
                        return listAllKeys(_.last(data.Contents).Key);
                    }
                });
        }

        return listAllKeys()
            .then(function() {
                return Promise.all(promises);
            });
    };



};
