const _ = require('lodash');
const path = require('path');

module.exports = function(app) {
  app.explorer.directory = function(config) {
    var model = config.model;

    model.observe('before save', function(ctx) {
      var instance = ctx.data || ctx.currentInstance || ctx.instance;
      var itemPath = instance.path.split('/');
      itemPath = _.compact(itemPath);
      itemPath.pop();
      itemPath = itemPath.join('/');
      console.log(instance, itemPath);
      return app.models.Directory.upsertWithWhere(
        {
          path: itemPath,
          namespace: config.namespace
        },
        {
          name: path.parse(itemPath).name || 'root',
          namespace: config.namespace,
          path: itemPath
        }
      ).then(function(directory) {
        instance.dirId = directory.id;
        console.log(directory);
      });
    });
  };
};
