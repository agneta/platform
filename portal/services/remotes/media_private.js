module.exports = function(Model, app) {

    var config = app.get('storage');

    require('./media/main')(Model, app, {
        name: 'public',
        bucket: config.buckets.private
    });

};
