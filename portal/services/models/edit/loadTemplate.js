const path = require('path');
const _ = require('lodash');
module.exports = function(Model, app) {

  Model.__loadTemplateData = function(options) {

    var templatePath = options.path;
    if(!options.data){
      templatePath = path.join(
        Model.editConfigDir,
        options.template + '.yml'
      );
    }
    var templateOptions = _.extend(options,{
      path: templatePath
    });

    return app.edit.loadTemplate(templateOptions);
  };

  Model.__loadTemplate = function(options) {
    var orderFields = [];

    return Promise.resolve()
      .then(function() {
        return Model.__loadTemplateData(options);
      })
      .then(function(templateData){
        templateData.list.order.map(function(fieldName){
          var field = templateData.field[fieldName];
          if(!field){
            return;
          }
          var title = app.lng(field.title,options.req);
          orderFields.push({
            title: `${title} - Ascending`,
            value: `${field.name} ASC`
          });
          orderFields.push({
            title: `${title} - Descending`,
            value: `${field.name} DESC`
          });
        });
        return {
          fields: templateData.fields,
          orderList: orderFields,
          title: templateData.title,
          id: templateData.id || options.template
        };
      });
  };

  Model.loadTemplate = function(template,req) {

    return Model.loadTemplate({
      template: template,
      req: req
    });

  };

  Model.remoteMethod(
    'loadTemplate', {
      description: 'Load template',
      accepts: [{
        arg: 'template',
        type: 'string',
        required: true
      }, {
        arg: 'req',
        type: 'object',
        'http': {
          source: 'req'
        }
      }],
      returns: {
        arg: 'result',
        type: 'object',
        root: true
      },
      http: {
        verb: 'get',
        path: '/load-template'
      },
    }
  );

};
