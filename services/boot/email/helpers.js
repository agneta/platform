const path = require('path');
const ejs = require('ejs');
const _ = require('lodash');
const fs = require('fs-extra');


module.exports = function(options){

  var templatePaths = options.templatePaths;
  var app = options.app;
  var clientHelpers = options.app.get('options').client.app.locals;

  var helpers = _.extend({},clientHelpers,{
    template: function(path_partial, data) {

      var file_path = helpers.getPath(path_partial + '.ejs');
      var file_content = fs.readFileSync(file_path, 'utf8');

      data = _.extend({}, this, data);

      return ejs.render.apply(this, [file_content, data]);
    },
    lng: function(obj) {
      var options;
      if(!obj){
        return;
      }
      if(obj.source){
        options = obj;
      }else{
        options = {
          source: obj,
          lang: this.language,
          templateData: this
        };
      }
      return app.lng(options);
    },
    getPath: function(path_partial){

      for(let templatePath of templatePaths){
        var file_path = path.join(templatePath, path_partial);
        if(fs.pathExistsSync(file_path)){
          return file_path;
        }
      }

      console.warn(`Could not find path for: ${path_partial}`);

    }
  });

  return helpers;
};
