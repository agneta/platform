const _ = require('lodash');

module.exports = function(app){

  var templateFields = require('./templateFields')(app);

  app.edit.scanTemplate = function(options){

    var template = options.data;

    return Promise.resolve()
      .then(function(){
        //-----------------------------------
        // Fix template Fields

        return templateFields(template.fields);

      })
      .then(function(){


        //-----------------------------------

        template.title = app.lng(template.title, options.req);

        //-----------------------------------
        // Field Names and access by name

        template.field = {};
        template.fieldNames = _.map(template.fields,
          function(field){
            field.title = app.lng(field.title, options.req);
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
      });
  };
};
