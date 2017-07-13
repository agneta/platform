const urljoin = require('url-join');

module.exports = function(app) {

    var config = app.get('storage');
    var bucket = config.buckets.app;

    switch (app.get('env')) {
        case 'production':
            bucket = bucket.production.private;
            break;
        default:
            bucket = bucket.private;
    }

    return function(data) {

        var key = urljoin(data.remotePath,'index.html');
        var params = {
            Bucket: bucket,
            Key: key
        };

        data.res.set('Content-Encoding', 'gzip');
        data.res.set('Content-Type', 'text/html; charset=utf-8');

        return app.storage.s3.getObject(params)
            .createReadStream()
            .on('error', function(err) {
                data.next(err);
            })
            .pipe(data.res);

    };

};
