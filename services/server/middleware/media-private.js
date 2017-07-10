const mime = require('mime-types');
const path = require('path');
const Promise = require('bluebird');

module.exports = function(app) {

    var client = app.get('options').client;
    var clientProject = client.project;

    var basePath = '/' + clientProject.config.media.base + '/';
    var bucket = app.get('storage').buckets.media;

    return function(req, res, next) {

        var remotePath = req.path;
        var Media_Private = app.models.Media_Private;

        if (remotePath.indexOf(basePath) !== 0) {
            return next();
        }

        remotePath = remotePath.substring(basePath.length);
        remotePath = path.normalize(remotePath);
        remotePath = Media_Private.__fixPath(remotePath);

        var params = {
            Bucket: bucket.private,
            Key: remotePath
        };

        var item;

        return Promise.resolve()
            .then(function() {

                //return app.storage.s3.headObjectAsync(params);
                return Media_Private.findOne({
                    where: {
                        location: remotePath
                    }
                });

            })
            .then(function(_item) {

                item = _item;

                if (!item) {
                    return Promise.reject({
                        message: 'Media file could not be found'
                    });
                }

                var roles = ['administrator', 'editor'];

                if (item.roles) {
                    roles = roles.concat(item.roles);
                }

                return app.models.Account.hasRoles(
                    roles,
                    req
                );

            })
            .then(function(result) {
                if (!result.has) {
                    //console.log(result);
                    return Promise.reject({
                        message: 'You are not authorized to access this media object'
                    });
                }
            })
            .then(function() {

                var ext = mime.extension(item.contentType);
                var filename = item.name + '.' + ext;

                res.set('Content-Type', item.contentType);
                res.set('Last-Modified', item.updatedAt);
                res.set('Content-Disposition', `filename="${filename}"`);

                app.storage.s3.getObject(params)
                    .createReadStream()
                    .on('error', function(err) {
                        next(err);
                    }).pipe(res);

            })
            .catch(next);
    };
};
