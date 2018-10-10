const Promise = require('bluebird');
const path = require('path');

module.exports = function(app) {
  const display = require('./display');

  return function(options) {
    options.source = options.source || options;
    var template = options.data;
    template.display = template.display || {};
    template.display.include = template.display.include || [];

    return Promise.resolve()
      .then(function() {
        //-----------------------------------
        // Relations

        var relations = (template.relations = []);
        return Promise.map(template.fields, function(field) {
          var relation = field.relation;
          if (!relation) {
            return;
          }

          relation.name = relation.name || field.name || relation.template;
          relation.label = relation.label || 'title';
          relation.key = field.name;
          relation.type = field.type;

          var templatePath =
            path.join(options.basePath, relation.template || '') + '.yml';

          return Promise.resolve()
            .then(function() {
              if (!relation.template) {
                let relationTemplate = {
                  field: {},
                  fields: [],
                  list: {
                    labels: relation.labels || {
                      title: 'title'
                    }
                  }
                };
                relation.templateData = relationTemplate;
                return relationTemplate;
              }
              return app.edit.loadTemplate({
                path: templatePath,
                skipScan: true
              });
            })
            .then(function(relationTemplate) {
              relation.name = relationTemplate.name || relation.name;
              relation.model = relationTemplate.model || relation.model;
              if (!relation.model) {
                throw new Error(`Relation must have a model: ${templatePath}`);
              }
            })
            .then(function() {
              if (field.type != 'relation-belongsTo') {
                return;
              }
              return Promise.resolve()
                .then(function() {
                  return app.edit.loadTemplate({
                    path: templatePath,
                    data: relation.templateData
                  });
                })
                .then(function(relationTemplate) {
                  relation.templateData = relationTemplate;
                  var displayScope = display({
                    templateData: relationTemplate
                  });

                  template.display.include.push({
                    relation: relation.name,
                    scope: displayScope
                  });
                });
            })
            .then(function() {
              relations.push(relation);
            });
        });
      })
      .then(function() {
        template.display.fields = display({
          templateData: template
        }).fields;

        return template;
      });
  };
};
