const _ = require('lodash');
const string = require('string');
var Promise = require('bluebird');

module.exports = function(Model, app) {

  var loadTemplates = Model.loadTemplates;
  var project = app.web.project;
  Model.loadTemplates = function(req){
    return Promise.resolve()
      .then(function(){
        return loadTemplates(req);
      })
      .then(function(result){
        var omitKeys = _.map(result.templates||[],function(item){
          return item.id;
        });
        var templates = _.keys(_.omit(project.site.templates,omitKeys))||[];
        templates = _.map(templates,function(id){
          return {
            id: id,
            title: string(id).humanize().s
          };
        });
        result.templates = result.templates.concat(templates);
        return result;
      });
  };

};
