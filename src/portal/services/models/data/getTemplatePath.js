const path = require('path');
const fs = require('fs-extra');
const Promise = require('bluebird');

module.exports = function(Model) {

  Model.__getTemplatePath = function(template){

    var result;
    return Promise.map(Model.__dataDirs,function(dataDir){

      var templatePath = path.join(
        dataDir,
        template + '.yml'
      );

      return fs.pathExists(templatePath)
        .then(function(exists){
          if(!exists){
            return;
          }
          result = templatePath;
        });


    })
      .then(function() {
        if(!result){
          return Promise.reject({
            statusCode: 400,
            message: `Could not find template with name: ${template}`
          });
        }
        return result;
      });


  };
};
