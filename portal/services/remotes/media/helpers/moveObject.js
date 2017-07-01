const urljoin = require('url-join');

module.exports = function(Model, app) {

    Model.__moveObject = function(operation) {
        return app.storage.s3.copyObjectAsync({
                Bucket: Model.__bucket.name,
                CopySource: urljoin(Model.__bucket.name, operation.source),
                Key: operation.target
            })
            .then(function() {
                return app.storage.s3.deleteObjectAsync({
                    Bucket: Model.__bucket.name,
                    Key: operation.source
                });
            });
    };
};
