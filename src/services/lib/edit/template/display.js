const _ = require('lodash');

module.exports = function(options){

  var templateData = options.templateData;
  var labels = templateData.list.labels;
  var fields = ['id'];
  var include = [];

  labels.metadata = labels.metadata || [];

  for(let key in labels){
    checkLabel(key);
  }

  for(let label of labels.metadata){
    checkLabel(label);
  }

  return {
    fields: fields,
    include: include
  };


  function checkLabel(label){

    label = labels[label] || label;
    if(!label){
      return;
    }
    if(!_.isString(label)){
      return;
    }
    if(!label.length){
      return;
    }
    var field = templateData.field[label] || {};

    if(field.relation){
      include.push({
        relation: field.relation.name,
        scope:{
          fields: [field.relation.label]
        }
      });
    }
    fields.push(label);
  }

};
