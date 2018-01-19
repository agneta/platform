module.exports = function(app, data) {
  var result = {
    name: data.model,
    base: 'PersistedModel',
    idInjection: true,
    options: {},
    properties: {},
    validations: [],
    methods: {},
    indexes: {}
  };

  app.form.fields({
    form: data,
    onField: function(field) {

      if(field.parent){
        return;
      }

      var type = field.valueType || field.type;

      switch (field.type) {
        case 'number':
          type = 'number';
          break;
      }

      switch (field.valueType) {
        case 'value':
          type = 'string';
          break;
      }

      var property = {
        type: type
      };

      if(field.validators && field.validators.required){
        property.required = true;
      }

      result.properties[field.name] = property;
    }
  });

  return result;
};
