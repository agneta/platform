module.exports = function(Model, app) {

    var config = app.get('storage');
    var bucket = config.buckets.media;

    app.requireServices('server/remotes/media/main')(Model, app, {
        name: 'public',
        bucket: {
            name: bucket.name,
            host: bucket.host,
        }
    });

};
