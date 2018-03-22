const _ = require('lodash');
const string = require('string');
module.exports = function(Model, app) {

  var loadTemplates = require('../edit/loadTemplates')(Model,app);
  var project = app.web.project;

  Model.loadTemplates = function(req){
    return loadTemplates(req)
      .then(function(result){
        var omitKeys = _.map(result.templates,function(item){
          return item.id;
        });
        var templates = _.keys(_.omit(project.site.templates,omitKeys));
        templates = _.map(templates,function(id){
          return {
            id: id,
            title: string(id).humanize().s
          };
        });
        result.templates = result.templates.concat(templates);
        console.log('result',result);
        return result;
      });
  };

};
