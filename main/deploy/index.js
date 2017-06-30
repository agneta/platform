var path = require('path');
var pkgcloud = require('pkgcloud');
var files = require('./files');
var start = require('../start');

function init() {
    var app = start.default();

    return app.promise
        .then(function() {
            return app.locals;
        });
}

function staging() {

    var project;
    var client;
    var bucket;

    return init()
        .then(function(locals) {

            project = locals.project;
            var config = project.config.storage;
            bucket = config.buckets.staging;

            client = pkgcloud.storage.createClient({
                provider: 'amazon',
                keyId: config.id,
                key: config.secret,
                region: config.region
            });

        })
        .then(function() {

            return files.sync({
                bucket: bucket.name,
                client: client,
                paths: [
                    path.join(project.paths.assetsTheme, 'lib'),
                    path.join(project.paths.assets, 'lib')
                ]
            });
        });
}

module.exports = {
    staging: staging
};
