const Promise = require('bluebird');
const _ = require('lodash');

module.exports = function(Model, app) {

  Model.__display = function(options) {

    var template =  options.template;
    var order =  options.order;
    var req =  options.re1;

    var templateData;
    var displayData;

    return Promise.resolve()
      .then(function() {
        if(options.templateData){
          return options.templateData;
        }
        return Model.__loadTemplateData({
          template: template
        });

      })
      .then(function(_templateData) {
        templateData = _templateData;
        displayData = getDisplayData({
          templateData: templateData
        });
        if(options.model){
          return options.model;
        }
        return Model.getTemplateModel(template);
      })
      .then(function(model) {
        _.extend(displayData.findFields,{
          id: true
        });

        if(options.id){
          return model.findById(options.id,{
            fields: displayData.findFields,
            include: displayData.includeFields,
            order: order
          })
            .then(onItem);
        }

        return model.find({
          fields: displayData.findFields,
          include: displayData.includeFields,
          order: order
        })
          .then(function(items) {
            return Promise.mapSeries(items, onItem);
          })
          .then(function(pages) {
            return {
              pages: pages
            };
          });

        function onItem(item) {
          return getValues({
            item: item,
            req: req,
            templateData: templateData,
            labels: displayData.labels
          });
        }
      });

  };

  function getDisplayData(options){

    var templateData = options.templateData;

    var labels = templateData.list.labels;
    var findFields = {};
    var includeFields = [];

    for(let key in labels){
      checkLabel(key);
    }

    labels.metadata = labels.metadata || [];
    for(let label of labels.metadata){
      checkLabel(label);
    }

    return {
      labels: labels,
      findFields: findFields,
      includeFields: includeFields
    };


    function checkLabel(label){

      label = labels[label] || label;
      var field = templateData.field[label] || {};

      if(field.relation){
        includeFields.push({
          relation: field.relation.name,
          scope:{
            fields: [field.relation.label]
          }
        });
        return;
      }
      findFields[label] = true;
    }

  }

  function getValues(options) {

    var item = options.item;
    var req = options.req;
    var labels = options.labels;
    var templateData = options.templateData;

    item = item.__data || item;
    var result = {
      id: item.id,
      metadata: []
    };

    result.title = getItem('title');
    result.subtitle = getItem('subtitle');
    result.image = getItem('image');

    for(let label of labels.metadata){
      let data = getItem(label);
      if(data){
        result.metadata.push(data);
      }
    }

    function getItem(label){
      label = labels[label]||label;
      var value;
      var field = templateData.field[label] || {};
      //console.log(field,item);
      if(field.relation){
        value = item[field.relation.name];
        if(value){
          value = value[field.relation.label];
        }
      }else{
        value = item[label];
      }
      var type = field.type;

      if(!value){
        return;
      }

      switch(field.type){
        case 'date-time':
          type = 'date';
          value = value+'';
          break;
        case 'media':
          value = value.location;
          break;
        case 'select':
          value = _.get(
            _.find(field.options,{value:value}),'title'
          ) || value;
          break;
      }

      if(_.isObject(value)){
        value = app.lng(value, req);
      }

      return {
        type: type,
        value: value
      };

    }

    return result;

  }
};
