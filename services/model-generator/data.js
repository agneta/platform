const path = require('path');
var fs = require('fs-extra');
var Promise = require('bluebird');
var yaml = require('js-yaml');
const dataDefinition = require('./data-definition');

module.exports = function(app, config) {

  var dataDir = path.join(
    process.cwd(), 'edit/data-remote'
  );

  app.dataRemote = {};

  return Promise.resolve()
    .then(function() {
      return fs.ensureDir(dataDir);
    })
    .then(function() {
      return fs.readdir(dataDir);
    })
    .then(function(files) {
      return Promise.map(files, function(filePath) {

        return fs.readFile(
          path.join(dataDir, filePath)
        )
          .then(function(content) {

            var data = yaml.safeLoad(content);
            data.name = data.name || path.parse(filePath).name;

            let definition = dataDefinition(app,data);
            let fileName = data.model.toLowerCase() + '.json';

            app.dataRemote[data.name] = {
              title: data.title,
              modelName: definition.name
            };

            config._definitions[fileName] = {
              definition: definition
            };

            config.models[definition.name] = {
              dataSource: 'db',
              public: true
            };

          });

      });
    });

};
