const Sync = require('../sync');
const SyncBuckets = require('../sync-buckets');
const Promise = require('bluebird');
const path = require('path');

module.exports = function(util) {

    var project = util.locals.project;

    var webProject = util.locals.web.project;
    var services = util.locals.services;

    return {
        run: function(options) {

            var sync = Sync(util);
            var syncBuckets = SyncBuckets(util);

            var storageConfig = services.get('storage');
            var operations = [];

            options.operations = options.operations || {};

            if (options.operations.lib) {

                operations.push({
                    method: syncBuckets,
                    options: {
                        source: storageConfig.buckets.lib.name,
                        target: storageConfig.buckets.lib.production
                    }
                });

            }

            if (options.operations.media) {

                operations.push({
                    method: syncBuckets,
                    options: {
                        source: storageConfig.buckets.media.name,
                        target: storageConfig.buckets.media.production
                    }
                });

            }

            if (options.operations.build_production) {

                operations.push({
                    method: sync,
                    options: {
                        source: path.join(webProject.paths.build, 'production', 'public'),
                        target: storageConfig.buckets.app.production.name
                    }
                });

                operations.push({
                    method: sync,
                    options: {
                        source: path.join(webProject.paths.build, 'production', 'private'),
                        target: storageConfig.buckets.app.production.private
                    }
                });

            }

            if (options.operations.build_staging) {

                operations.push({
                    method: sync,
                    options: {
                        source: path.join(webProject.paths.build, 'staging', 'public'),
                        target: storageConfig.buckets.app.name
                    }
                });

                operations.push({
                    method: sync,
                    options: {
                        source: path.join(webProject.paths.build, 'staging', 'private'),
                        target: storageConfig.buckets.app.private
                    }
                });

            }

            if (!operations.length) {
                return Promise.reject({
                    message: 'Nothing to perform. Select at least one operation.'
                });
            }

            return Promise.each(operations, function(operation) {
                return operation.method(
                    operation.options
                );
            });

        },
        parameters: [{
            name: 'operations',
            title: 'Sync Operations',
            type: 'checkboxes',
            values: [{
                name: 'media',
                title: 'Media'
            }, {
                name: 'lib',
                title: 'Libraries'
            }, {
                name: 'build_production',
                title: 'Production Build'
            }, {
                name: 'build_staging',
                title: 'Staging Build'
            }]
        }]
    };

};
