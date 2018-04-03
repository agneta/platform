const _ = require('lodash');

module.exports = function(app){

  var templateFields = require('./templateFields')(app);

  app.edit.scanTemplate = function(options){

    //-----------------------------------
    // Fix template Fields

    var template = options.data;

    templateFields(template.fields);

    //-----------------------------------

    if(options.req){
      template.title = app.lng(template.title, options.req);
    }

    //-----------------------------------
    // Field Names and access by name

    template.field = {};
    template.fieldNames = _.map(template.fields,
      function(field){

        if(field.name){
          template.field[field.name] = field;
        }

        return field.name;
      });

    //-----------------------------------
    // Relations

    var relations = [];
    template.fields.forEach(function(field){
      var relation = field.relation;
      if(relation){
        relation.name = relation.name || relation.template;
        relation.label = relation.label || 'title';
        relations.push(relation);
      }
    });
    template.relations = relations;

    //-----------------------------------
    // List Options

    template.list = template.list || {};
    template.list = _.defaults(template.list,{
      order: ['title','created_at','modified_at'],
      labels:  {
        title: 'title',
        subtitle: 'path',
        image: 'cover'
      }
    });

    return template;
  };
};
