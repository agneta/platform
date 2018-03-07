const fs = require('fs-extra');
const path = require('path');
const Promise = require('bluebird');

module.exports = function(locals) {
  var project = locals.project;

  var keywordPaths = project.config.languages.map(function(lang){
    return path.join(
      project.paths.app.generated,
      `keywords_${lang.key}.json`
    );
  });

  return Promise.map(keywordPaths,function(keywordPath) {
    return fs.pathExists(keywordPath)
      .then(function(exists) {
        if(exists){
          return;
        }
        return fs.outputJSON(keywordPath,[]);
      });
  });
};
