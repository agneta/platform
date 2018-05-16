const templateBase = require('./templateBase');
const _ = require('lodash');

module.exports = function(Model, app) {

  require('../data/loadTemplate')(Model,app);

  Model.loadTemplate = function(template,req) {

    return Promise.resolve()
      .then(function() {
        return Model.__getTemplatePath(template)
          .catch(function() {
            return;
          });
      })
      .then(function(templatePath) {
        var options;

        if(templatePath){
          options = {
            template: template,
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
