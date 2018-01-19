const path = require('path');
var fs = require('fs-extra');
var Promise = require('bluebird');
var yaml = require('js-yaml');
const dataDefinition = require('./data-definition');

module.exports = function(app, config) {

  var dataDir = path.join(
    process.cwd(), 'edit/data-remote'
  );
  var templates = [];

  app.dataRemote = {
    templates: templates
  };

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

            templates.push({
              name: data.name,
              title: data.title
            });

            let definition = dataDefinition(app,data);
            let fileName = data.model.toLowerCase() + '.json';
            console.log(definition);

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
