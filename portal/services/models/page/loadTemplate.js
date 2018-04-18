const path = require('path');
const templateBase = require('./templateBase');
const fs = require('fs-extra');

module.exports = function(Model, app) {

  require('../edit/loadTemplate')(Model,app);

  Model.loadTemplate = function(template,req) {

    var templatePath = path.join(Model.editConfigDir, template + '.yml');

    return Promise.resolve()
      .then(function() {
        return fs.pathExists(templatePath);
      })
      .then(function(exists) {
        if(!exists){
          return app.edit.loadTemplate({
            req: req,
            data: {
              fields: templateBase
            }
          });
        }
        return app.edit.loadTemplate({
          path: templatePath,
          base: templateBase,
          req: req
        });

      })
      .then(function(_template) {

        template = _template;
        template.id = template;
      });

  };

};
