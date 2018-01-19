module.exports = function(data) {
  var result = {
    name: data.name,
    base: 'PersistedModel',
    idInjection: true,
    options: {},
    properties: {},
    validations: [],
    methods: {},
    indexes: {}
  };

  for(var field in data.fields){
    console.log(field);
    result.properties[field.name] = {

    };
  }

  return result;
};
