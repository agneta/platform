const _ = require('lodash');
module.exports = function(locals) {
  var project = locals.project;
  var appName = locals.app.get('name');
  var model = locals.services.models.Page;

  console.log(project.paths.core.cache);
  model.observe('after save', function(ctx) {
    //console.log(ctx);
    return Promise.resolve();
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
      return model.findOne(fixFilter(options));
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
