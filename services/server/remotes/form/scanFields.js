var _ = require('lodash');

module.exports = function(Model) {


  Model.scanFields = function(options) {

    var form = options.form;
    var onField = options.onField;
    var formFields = {};

    if(_.isString(form)){
      form = {
        name: form,
        data: Model.clientHelpers.get_data('form/presets/'+form)
      };
    }

    scan(form.data);

    function scan(data){

      if (_.isString(data)) {
        data = Model.clientHelpers.get_data(data);
      }

      for (var field of data.fields) {

        field = Model.clientHelpers.form_field(field, form);
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

        if(onField){
          onField(field);
        }

      }

    }

    return formFields;


  };

};
