const _ = require('lodash');
const path = require('path');
const Promise = require('bluebird');

module.exports = function(app) {
  app.explorer.directory = function(config) {
    var model = config.model;
    var listDirectories = app.explorer.list({
      model: app.models.Directory,
      fields: {
        name: true,
        path: true
      }
    });

    var listItems = app.explorer.list(
      _.extend(
        {
          overrideWhere: true
        },
        config
      )
    );

    model.observe('before save', function(ctx) {
      var instance = ctx.data || ctx.currentInstance || ctx.instance;
      var itemPath = instance.path.split('/');
      itemPath = _.compact(itemPath);
      itemPath.pop();
      itemPath = itemPath.join('/');
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
      });
    });

    function list(options) {
      var result;
      return Promise.resolve()
        .then(function() {
          return listDirectories({
            dir: options.dir,
            where: {
              namespace: config.namespace
            },
            order: ['name ASC']
          });
        })
        .then(function(_result) {
          result = _result;
          return Promise.mapSeries(result.objects, function(dir) {
            return {
              title: dir.name,
              location: dir.path,
              type: 'folder'
            };
          });
        })
        .then(function(objects) {
          result.objects = objects;
          console.log({
            path: options.dir,
            namespace: config.namespace
          });
          return app.models.Directory.findOne({
            where: {
              path: options.dir,
              namespace: config.namespace
            }
          });
        })
        .then(function(dir) {
          let findOptions = _.omit(options, ['dir']);
          findOptions.where = findOptions.where || {};
          findOptions.where.dirId = dir.id;
          return listItems(findOptions);
        })
        .then(function(_result) {
          _result.objects = result.objects.concat(_result.objects);
          _result.count += result.count;
          result = _result;
          return result;
        });
    }

    return {
      list: list
    };
  };
};
