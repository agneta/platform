var path = require('path');
var fs = require('fs');

module.exports = function(options) {
  var dirs = options.dirs;
  var app = options.app;
  return function(file) {

    var fileParsed = path.parse(file);
    var fileName = fileParsed.name;
    var dirName = path.parse(fileParsed.dir).name;

    for (let dir of dirs) {

      let definitionPath = path.join(dir,fileName) + '.json';
      let exists = fs.existsSync(definitionPath);

      if (!exists) {
        definitionPath = path.join(dir, dirName, 'index.json');
        exists = fs.existsSync(definitionPath);
      }

      if (exists) {

        let definition = require(definitionPath);
        if (!definition.name) {
          return;
        }

        let model = app.models[definition.name];

        if(model){
          return model;
        }
      }

    }

    //------------------------------------
    // Search by file name

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
        return model;
      }
    }
  };

};
