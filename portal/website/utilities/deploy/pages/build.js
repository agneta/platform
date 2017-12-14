const Sync = require('../../lib/sync/files');
const path = require('path');

module.exports = function(util) {

  var webProject = util.locals.web.project;
  var services = util.locals.services;
  var sync = Sync(util);
  var storageConfig = services.get('storage');

  return {
    production: function() {

      return sync({
        source: path.join(webProject.paths.app.build, 'production', 'public'),
        target: storageConfig.buckets.assets.production
      })
        .then(function() {
          return sync({
            source: path.join(webProject.paths.app.build, 'production', 'private'),
            target: storageConfig.buckets.app.production.private
          });
        });

    },
    staging: function() {

      return sync({
        source: path.join(webProject.paths.app.build, 'staging', 'public'),
        target: storageConfig.buckets.assets.name
      })
        .then(function() {
          return sync({
            source: path.join(webProject.paths.app.build, 'staging', 'private'),
            target: storageConfig.buckets.app.private
          });

        });

    }
  };
};
