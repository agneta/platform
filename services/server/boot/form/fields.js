var _ = require('lodash');

module.exports = function(app, clientHelpers) {

  app.form.fields = function(options) {

    var form = options.form;
    var onField = options.onField;
    var formFields = {};


    if (_.isString(form)) {
      form = {
        name: form,
        data: clientHelpers.get_data('form/presets/' + form)
      };
    }

    if(!form.data.name){
      form.data.name = form.name;
    }

    scan(form.data);

    function scan(data) {

      if (_.isString(data)) {
        data = clientHelpers.get_data(data);
      }

      for (var field of data.fields) {

        field = clientHelpers.form_field(field, data);
        if (field.fields) {
          scan(field);
          continue;
        }

        if (!field.name) {
          continue;
        }

        if (field.static) {
          continue;
        }

        formFields[field.name] = field;

        if (onField) {
          onField(field);
        }

      }

    }

    return formFields;


  };

};
