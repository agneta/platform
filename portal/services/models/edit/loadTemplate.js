const path = require('path');

module.exports = function(Model, app) {

  Model.__loadTemplate = function(options) {
    var template = options.template;
    var req = options.req;

    return app.edit.loadTemplate({
      path: path.join(Model.editConfigDir, template + '.yml'),
      req: req
    });
  };

  Model.loadTemplate = function(template,req) {

    var orderFields = [];

    return Promise.resolve()
      .then(function() {
        return Model.__loadTemplate({
          template: template,
          req: req
        });
      })
      .then(function(templateData){
        templateData.list.order.map(function(fieldName){
          var field = templateData.field[fieldName];
          if(!field){
            return;
          }
          var title = app.lng(field.title,req);
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
          id: templateData.id
        };
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
