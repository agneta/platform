const Sync = require('../lib/sync/files');
const SyncBuckets = require('../lib/sync/buckets');
const Promise = require('bluebird');
const path = require('path');

module.exports = function(util) {

  var webProject = util.locals.web.project;
  var services = util.locals.services;

  return function(options) {

    var sync = Sync(util);
    var syncBuckets = SyncBuckets(util);

    var storageConfig = services.get('storage');
    var operations = [];

    if (options.promote.lib) {

      operations.push({
        method: syncBuckets,
        options: {
          source: storageConfig.buckets.lib.name,
          target: storageConfig.buckets.lib.production
        }
      });

    }

    if (options.promote.media) {

      operations.push({
        method: syncBuckets,
        options: {
          source: storageConfig.buckets.media.name,
          target: storageConfig.buckets.media.production
        }
      });

    }

    if (options.promote.build) {

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

    if (options.stage.build) {

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

    return Promise.each(operations, function(operation) {
      return operation.method(
        operation.options
      );
    });

  };
};
