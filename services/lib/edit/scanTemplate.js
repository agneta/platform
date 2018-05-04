const _ = require('lodash');
const Promise = require('bluebird');
const path = require('path');

module.exports = function(app){

  var templateFields = require('./templateFields')(app);

  app.edit.scanTemplate = function(options){

    var template = options.data;

    return Promise.resolve()
      .then(function(){
        //-----------------------------------
        // Fix template Fields

        return templateFields({
          fields: template.fields,
          req: options.req
        });

      })
      .then(function(){


        //-----------------------------------

        template.title = app.lng(template.title, options.req);

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
        return Promise.map(template.fields,function(field){
          var relation = field.relation;
          if(relation){
            relation.name = relation.name || relation.template;
            relation.label = relation.label || 'title';

            if(relation.template && options.basePath){
              return app.edit.loadTemplate({
                path: path.join(options.basePath,relation.template)+'.yml',
                skipScan: true
              })
                .then(function(relationTemplate){
                  relation.name = relationTemplate.name || relation.name;
                  relation.model = relationTemplate.model || relation.model;
                });
            }

            relations.push(relation);
          }
        })
          .then(function(){
            template.relations = relations;
          });
      })
      .then(function() {

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
