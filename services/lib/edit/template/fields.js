const _ = require('lodash');
module.exports = function(app) {

  var web = app.web || app.client;
  var webHelpers = web.app.locals;

  return function(templateData){

    return Promise.resolve()
      .then(function() {

        scan(templateData.fields);
        templateData.field = {};
        templateData.fieldNames = _.map(templateData.fields,
          function(field) {
            if (field.name) {
              templateData.field[field.name] = field;
            }

            return field.name;
          });

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
              field.name = field.name || name;
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
      });


  };
};
