const path = require('path');
const Promise = require('bluebird');
const _ = require('lodash');

module.exports = function(app) {

    var basePath = '/media/';
    var bucket = app.get('storage').buckets.media;

    return function(req, res, next) {

        var remotePath = req.path;

        if (remotePath.indexOf(basePath) !== 0) {
            return next();
        }

        remotePath = remotePath.substring(basePath.length);
        remotePath = path.normalize(remotePath);

        var parsed = path.parse(remotePath);
        parsed = path.parse(remotePath);

        var params = {
            Bucket: bucket.private,
            Key: remotePath
        };

        return Promise.resolve()
            .then(function() {
                /*
                    return app.models.Account.hasRoles(
                            page.authorization,
                            req
                        )
                        .then(function(result) {
                            if (!result.has) {
                              console.log('test this');
                            }
                        });
                }*/

            })
            .then(function() {

                return app.storage.s3.headObjectAsync(params);

            })
            .then(function(headers) {

                res.set('Accept-Ranges',headers.AcceptRanges);
                res.set('Content-Length',headers.ContentLength);
                res.set('Content-Type',headers.ContentType);
                res.set('Last-Modified',headers.LastModified);

                app.storage.s3.getObject(params)
                    .createReadStream()
                    .on('error', function(err) {
                        next(err);
                    }).pipe(res);

            })
            .catch(next);
    };
};
