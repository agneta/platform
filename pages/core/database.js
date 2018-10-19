const _ = require('lodash');
module.exports = function(locals) {
  var project = locals.project;
  var appName = locals.app.get('name');
  var model = locals.services.models.Page;

  project.site.pages = {
    find: function(options) {
      _.defaultsDeep(options, {
        where: {
          app: appName
        }
      });
      return model.find(options);
    },
    findOne: function(options) {
      _.defaultsDeep(options, {
        where: {
          app: appName
        }
      });
      console.log(appName, options);
      return model.findOne(options);
    },
    count: function(options) {
      _.defaultsDeep(options, {
        app: appName
      });
      return model.findOne(options);
    }
  };
};
