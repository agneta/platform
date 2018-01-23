module.exports = function(app, data) {
  var result = {
    name: data.model,
    base: 'PersistedModel',
    idInjection: true,
    options: {},
    properties: {},
    relations: {},
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


    switch (type) {
      case 'array':
        if(field.fields){
          type = ['object'];
        }
        break;
      case 'value':
        type = field.valueType || 'string';
        break;
      case 'text':
      case 'text-rich':
        type = 'object';
        break;
      case 'date-time':
        type = 'date';
        break;
      case 'relation':
        if(!field.relation){
          throw new Error(`Field (${field.name}) needs to have a relation object defined`);
        }
        if(!field.relation.type){
          throw new Error(`Field (${field.name}) needs to have a relation type defined`);
        }
        if(!field.relation.model){
          throw new Error(`Field (${field.name}) needs to have a relation model defined`);
        }
        if(!field.relation.template){
          throw new Error(`Field (${field.name}) needs to have a relation template defined`);
        }
        result.relations[field.relation.template] = {
          model: field.relation.model,
          type: field.relation.type,
          foreignKey: field.name
        };
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
