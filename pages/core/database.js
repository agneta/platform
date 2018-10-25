const _ = require('lodash');
const md5 = require('md5');
const LRU = require('lru-cache');
module.exports = function(locals) {
  var project = locals.project;
  var appName = locals.app.get('name');
  var model = locals.services.models.Page;

  var cache = LRU({
    max: 500 * 1000,
    length: function(item) {
      if (!item) {
        return 1;
      }
      return item.length;
    }
  });

  model.observe('after save', function() {
    return Promise.resolve().then(function() {
      console.log('cache reset');
      cache.reset();
    });
  });

  project.site.pages = {
    upsertWithWhere: function(filter, data) {
      filter.app = appName;
      data.app = appName;

      return model.upsertWithWhere(filter, data);
    },
    find: function(options) {
      return model.find(fixFilter(options));
    },
    findOne: function(options) {
      var cacheKey = md5(JSON.stringify(options));
      //console.log(cache.length);
      return Promise.resolve().then(function() {
        var cached = cache.get(cacheKey);
        if (cached) {
          //console.log('using cache');
          return JSON.parse(cached);
        }
        return model.findOne(fixFilter(options)).then(function(result) {
          result = result || {};
          result = result.__data;
          cache.set(cacheKey, JSON.stringify(result));
          return result;
        });
      });
    },
    count: function(options) {
      _.defaultsDeep(options, {
        app: appName
      });
      return model.count(options);
    }
  };

  function fixFilter(options) {
    if (!options.where) {
      options = {
        where: options
      };
    }

    _.defaultsDeep(options, {
      where: {
        app: appName
      }
    });

    return options;
  }
};
