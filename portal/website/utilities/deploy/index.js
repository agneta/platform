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

            if (options.operations.build) {

                operations.push({
                    method: sync,
                    options: {
                        source: path.join(webProject.paths.build, 'production'),
                        target: storageConfig.buckets.app.production
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
                name: 'build',
                title: 'Production Build'
            }]
        }]
    };

};
