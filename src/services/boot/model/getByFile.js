const path = require('path');
const fs = require('fs');
const _ = require('lodash');

module.exports = function(options) {
  var dirs = options.dirs;
  var app = options.app;
  return function(file) {

    var check;

    for (let dir of dirs) {

      check = checkDir(dir, file);
      //console.log(check);
      if (check) {

        if(check.model){
          return check.model;
        }

        let definition = require(check.definitionPath);
        if (!definition.name) {
          return;
        }

        let model = app.models[definition.name];

        if(model){
          return model;
        }



      }

    }

    function checkDir(dir,file){

      var fileParsed = path.parse(file);
      var fileName = fileParsed.name;
      var dirName = path.parse(fileParsed.dir).name;

      let definitionPath = path.join(dir,fileName) + '.json';
      let exists = fs.existsSync(definitionPath);
      //console.log(dir);
      //console.log(file);
      //console.log(fileName);
      //console.log(dirName);
      //console.log('---------------------');
      if (!exists) {
        definitionPath = path.join(dir, dirName, 'index.json');
        exists = fs.existsSync(definitionPath);
      }

      if(!exists){
        if(fileParsed.dir){
          if((fileParsed.dir+'/').indexOf(dir)===0){
            exists = checkDir(dir,fileParsed.dir);
          }
        }
      }

      if(!exists){

        var names = [
          fileName,
          dirName
        ];

        for(let name of names){
          let nameParts = name.split('_');
          let modelName = [];
          for (let part of nameParts) {
            modelName.push(
              part[0].toUpperCase() + part.slice(1)
            );
          }
          modelName = modelName.join('_');
          let model = app.models[modelName];
          if(model){
            return {
              model: model
            };
          }
        }
      }

      if(!exists){
        return;
      }

      return _.isObject(exists)?exists:{
        definitionPath: definitionPath,
        fileName: fileName,
        dirName: dirName
      };

    }
  };

};
