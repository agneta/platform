const _ = require('lodash');
const Promise = require('bluebird');
const path = require('path');

module.exports = function(app){

  var templateFields = require('./templateFields')(app);

  app.edit.scanTemplate = function(options){

    options.source = options.source || options;
    var template = options.data;
    template.display = {
      include: []
    };

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

        var relations = template.relations = [];
        return Promise.map(template.fields,function(field){

          var relation = field.relation;
          if(!relation){
            return;
          }

          relation.name = relation.name || relation.template;
          relation.label = relation.label || 'title';
          relation.key = field.name;

          var displayInclude = [];
          var displayFields = ['id'].concat(
            relation.display?_.values(relation.display):['title']
          );

          var templatePath = path.join(options.basePath,relation.template||'')+'.yml';

          return Promise.resolve()
            .then(function(){

              if(!relation.template){
                return;
              }

              return app.edit.loadTemplate({
                path: templatePath,
                skipScan: true
              })
                .then(function(relationTemplate){
                  relation.name = relationTemplate.name || relation.name;
                  relation.model = relationTemplate.model || relation.model;
                  if(!relation.model){
                    throw new Error(`Relation must have a model: ${templatePath}`);
                  }
                });
            })
            .then(function(){
              if(field.type!='relation-belongsTo'){
                return;
              }
              if(!relation.template){
                return;
              }
              return app.edit.loadTemplate({
                path: templatePath
              })
                .then(function(relationTemplate){
                  displayFields = displayFields.map(function(fieldDisplay){
                    var name = fieldDisplay;
                    if(_.isObject(fieldDisplay)){
                      name = fieldDisplay.name;
                    }
                    var field = relationTemplate.field[name];
                    if(!field || !field.relation){
                      return name;
                    }
                    displayInclude.push({
                      relation: field.relation.name,
                      scope: field.relation.displayScope
                    });
                    return name;
                  });

                  displayFields = _.compact(displayFields);

                });

            })
            .then(function(){

              relation.displayScope = {
                include: displayInclude,
                fields: displayFields
              };

              template.display.include.push({
                relation: relation.name,
                scope: relation.displayScope}
              );

              relations.push(relation);
            });
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
