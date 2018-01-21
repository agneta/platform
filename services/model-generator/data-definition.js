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

  var template = app.edit.loadTemplate({
    data: data
  });

  for(var field of template.fields){

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

  result.properties.name = {
    type: 'string',
    required: true
  };

  return result;
};
