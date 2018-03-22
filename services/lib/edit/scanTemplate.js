const _ = require('lodash');

module.exports = function(app){

  var web = app.get('options');
  web = web.web || web.client;
  var webHelpers = web.app.locals;

  app.edit.scanTemplate = function(options){

    var template = options.data;
    function scan(collection) {

      for (var key in collection) {
        collection[key] = getField(collection[key]);
      }

      function getField(field) {

        if (_.isString(field)) {
          var name = field;
          field = webHelpers.get_data('edit/fields/' + field);
          if(!field){
            return Promise.reject({
              statusCode: 400,
              message: `Could not find field from template with name: ${name}`
            });
          }
          field.name = name;
        }

        if (_.isObject(field)) {
          if (field.extend) {
            _.defaults(field, getField(field.extend));
            field.name = field.name || field.extend;
            delete field.extend;
          }
        }

        if (field.fields) {
          scan(field.fields);
        }

        return field;
      }

    }

    scan(template.fields);

    if(options.req){
      template.title = app.lng(template.title, options.req);
    }

    template.fieldNames = _.map(template.fields,
      function(field){
        return field.name;
      });

    var relations = [];
    template.fields.forEach(function(field){
      var relation = field.relation;
      if(relation){
        relation.name = relation.name || relation.template;
        relations.push(relation);
      }
    });
    template.relations = relations;

    return template;
  };
};
