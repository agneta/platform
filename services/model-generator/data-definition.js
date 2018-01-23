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
    var relation = field.relation;

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
      case 'select':
        type = 'string';
        break;
      case 'text':
      case 'text-rich':
        type = 'object';
        break;
      case 'date-time':
        type = 'date';
        break;
      case 'relation-hasMany':
      case 'relation-belongsTo':

        if(!relation){
          throw new Error(`Field (${field.name}) needs to have a relation object defined`);
        }
        if(!relation.model){
          throw new Error(`Field (${field.name}) needs to have a relation model defined`);
        }
        if(!relation.template){
          throw new Error(`Field (${field.name}) needs to have a relation template defined`);
        }
        var options = {
          model: relation.model,
          type: type.split('-')[1]
        };

        switch(options.type){
          case 'belongsTo':
            options.foreignKey = field.name;
            result.properties[field.name] = {
              type: 'string'
            };
            break;
          case 'hasMany':
            if(!relation.foreignKey){
              throw new Error(`Field (${field.name}) needs to have a foreignKey defined for a hasMany relation`);
            }
            options.foreignKey = relation.foreignKey;
            type = 'array';
            break;
        }

        result.relations[relation.template] = options;
        continue;
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
