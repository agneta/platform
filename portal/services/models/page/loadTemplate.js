const path = require('path');
const templateBase = require('./templateBase');
const fs = require('fs-extra');
const _ = require('lodash');

module.exports = function(Model, app) {

  require('../data/loadTemplate')(Model,app);

  Model.loadTemplate = function(template,req) {

    var templatePath = path.join(Model.editConfigDir, template + '.yml');

    return Promise.resolve()
      .then(function() {
        return fs.pathExists(templatePath);
      })
      .then(function(exists) {
        var options;

        if(exists){
          options = {
            path: templatePath,
            base: templateBase
          };
        }else{
          options = {
            data: {
              fields: templateBase
            }
          };
        }

        _.extend(options,{
          template: template,
          req: req
        });
        return Model.__loadTemplate(options);

      });

  };

};
