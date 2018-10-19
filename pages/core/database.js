const _ = require('lodash');
module.exports = function(locals) {
  var project = locals.project;
  var appName = locals.app.get('name');
  var model = locals.services.models.Page;

  project.site.pages = {
    findOne: function(options) {
      _.defaults(options, {
        where: {
          app: appName
        }
      });
      return model.findOne(options);
    },
    count: function(options) {
      _.defaults(options, {
        app: appName
      });
      return model.findOne(options);
    }
  };
};
