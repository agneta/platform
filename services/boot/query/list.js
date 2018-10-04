const _ = require('lodash');

module.exports = function(app) {
  app.query.list = function(config) {
    var model = config.model;
    var pathProp = config.pathProp || 'path';
    var pathBase = config.pathBase || '';
    return function(options) {
      var dir = options.dir;
      var limit = options.limit;
      var marker = options.marker;
      var objects = [];
      var whereFilter = {};

      return Promise.resolve()
        .then(function() {
          marker = marker || 0;
          dir = dir || '';

          //---------------------------------------------------

          dir = dir.split('/').join('\\/');
          if (dir && dir.length) {
            dir += '\\/';
          }

          var regexp = '/^' + pathBase + dir + '[^\\/]+$/';

          whereFilter[pathProp] = {
            regexp: regexp
          };

          if (options.where) {
            _.extend(whereFilter, options.where);
          }
          console.log(whereFilter, marker);
          return model.find({
            where: whereFilter,
            limit: limit,
            fields: config.fields,
            skip: marker,
            order: ['type ASC', 'name ASC']
          });
        })
        .then(function(_objects) {
          if (model.__prepareObject) {
            for (var object of _objects) {
              model.__prepareObject(object);
            }
          }

          objects = _objects;

          return model.count(whereFilter);
        })
        .then(function(count) {
          var truncated = count - marker > limit;
          var nextMarker;
          var nextLimit;

          if (truncated) {
            nextMarker = marker + limit;
            nextLimit = Math.min(count - nextMarker, limit);
          }

          return {
            objects: objects,
            nextMarker: nextMarker,
            nextLimit: nextLimit,
            truncated: truncated,
            count: count
          };
        });
    };
  };
};
