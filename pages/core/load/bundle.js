const _ = require('lodash');
const fs = require('fs-extra');
const path = require('path');

module.exports = function(project) {

  return Promise.resolve()
    .then(function() {
      let content = '';

      concat('lib/angular.min');

      for (var lib of _.uniqBy(project.config.angular_libs, 'js')) {
        concat(lib.js);
      }

      for (var script of _.uniq(project.config.scripts)) {
        concat(script);
      }

      function concat(script) {
        content += `require('${script}');\n`;
      }

      var outputPath = path.join(project.paths.app.source,'bundle.js');
      console.log(outputPath);
      return fs.outputFile(outputPath,content);

    });

};
