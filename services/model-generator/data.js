const path = require('path');
var fs = require('fs-extra');
var Promise = require('bluebird');
var yaml = require('js-yaml');
const dataDefinition = require('./data-definition');

module.exports = function(app, config) {

  var dataDir = path.join(
    process.cwd(), 'edit/data-remote'
  );
  var dataTemplates = [];

  return Promise.resolve()
    .then(function() {
      return fs.ensureDir(dataDir);
    })
    .then(function() {
      return fs.readdir(dataDir);
    })
    .then(function(files) {
      return Promise.map(files, function(filePath) {
        var filename = path.parse(filePath).name;

        return fs.readFile(
          path.join(dataDir, filePath)
        )
          .then(function(content) {

            var data = yaml.safeLoad(content);
            console.log(data);

            dataTemplates.push({
              title: data.title
            });

            config._definitions[filename] = {
              definition: dataDefinition(data)
            };
          });

      });
    });

};
