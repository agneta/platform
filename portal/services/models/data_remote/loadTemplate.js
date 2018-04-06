const path = require('path');

module.exports = function(Model, app) {

  Model.loadTemplate = function(options) {

    var template = options.template;
    var req = options.req;

    return Promise.resolve()
      .then(function() {
        return app.edit.loadTemplate({
          path: path.join(Model.editConfigDir, template + '.yml'),
          req: req
        });
      });

  };

};
