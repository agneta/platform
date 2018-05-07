const _ = require('lodash');

module.exports = function(Model, app) {

  Model.__loadTemplateData = function(options) {

    return Promise.resolve()
      .then(function() {

        if(!options.data){
          return Model.__getTemplatePath(options.template);
        }

        return options.path;

      })
      .then(function(templatePath) {

        var templateOptions = _.extend(options,{
          path: templatePath
        });

        return app.edit.loadTemplate(templateOptions);

      });

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

        var fields = templateData.fields.map(function(field) {
          field.relation = _.omit(field.relation,['templateData']);
          return field;
        });

        return {
          fields: fields,
          orderList: orderFields,
          title: templateData.title,
          id: templateData.id || options.template
        };
      });
  };

  Model.loadTemplate = function(template,req) {

    return Model.__loadTemplate({
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
