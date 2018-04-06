const _ = require('lodash');
module.exports = function(app) {

  var web = app.get('options');
  web = web.web || web.client;
  var webHelpers = web.app.locals;

  return function(options){

    var fields = options.fields;
    var req = options.req;
    return scan(fields);

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

        field = app.lngScan(field, req);

        return field;
      }

    }


  };
};
