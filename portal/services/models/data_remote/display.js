const Promise = require('bluebird');
const _ = require('lodash');

module.exports = function(Model, app) {

  Model.__display = function(options) {

    var template =  options.template;
    var order =  options.order;
    var req =  options.req;

    var templateData;

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
        if(options.model){
          if(_.isString(options.model)){
            return Model.projectModel(options.model);
          }
          return options.model;
        }
        return Model.getTemplateModel(template);
      })
      .then(function(model) {

        var displayOptions = templateData.display;
        displayOptions = _.cloneDeep(displayOptions);

        _.extend(displayOptions,{
          order: order
        });

        //console.log(require('util').inspect(displayOptions, { depth: null }));

        if(options.id){
          return model.findById(options.id,displayOptions)
            .then(onItem);
        }

        return model.find(displayOptions)
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
            templateData: templateData
          });
        }
      });

  };

  function getValues(options) {

    var item = options.item;
    var req = options.req;
    var templateData = options.templateData;
    var labels = templateData.list.labels;
    labels.metadata = labels.metadata || [];

    item = item.__data || item;
    var result = {
      id: item.id,
      metadata: []
    };

    //console.log(item, labels);

    return Promise.all([
      Promise.map(['title','subtitle','image'],function(name){
        return getItem(name)
          .then(function(item){
            result[name] = item;
          });
      }),
      Promise.map(labels.metadata,function(label){
        return getItem(label)
          .then(function(item){
            result.metadata.push(item);
          });
      })
    ])
      .then(function(){
        return result;
      });

    function getItem(labelOriginal){

      var value;
      var label = labels[labelOriginal]||labelOriginal;
      var labelName = labelOriginal;
      if(_.isObject(label)){
        labelName = label.label || labelName;
        label = label.field || labelOriginal;
      }
      var field = templateData.field[label] || {};

      return Promise.resolve()
        .then(function() {

          if(!field.relation){
            return;
          }

          if (field.type != 'relation-belongsTo') {
            return;
          }

          value = item[field.relation.name];

          if(!value){
            return;
          }

          return getValues({
            item: value,
            req: req,
            templateData: field.relation.templateData
          })
            .then(function(display) {
              value = display;
            });
        })
        .then(function() {

          if(!value){
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
              value = app.lng(value, req);
              break;
            case 'relation-belongsTo':
              //console.log('--------------');
              //console.log(value,labelName);
              value = value[labelName];
              if(value && value.value){
                value = value.value;
              }
              break;
            default:
              if(_.isObject(value)){
                value = app.lng(value, req);
              }
              break;
          }



          return {
            type: type,
            value: value
          };

        });


    }

  }
};
