const path = require('path');
const _ = require('lodash');
const generator = require('loopback-sdk-angular');
const fs = require('fs-extra');

module.exports = function(app) {
  var client = app.client;
  var project = client.project;

  return function(options){

    options = options || {};
    var outputDir = options.outputDir || project.paths.app.generated;
    var log = options.log || console.log;
    var filter = options.filter;
    return Promise.resolve()
      .then(function() {
        if(filter && !filter.services){
          return;
        }
        log('Exporting Services...');
        return services();
      })
      .then(function() {
        if(filter && !filter.bundles){
          return;
        }
        log('Exporting Library Bundle...');
        return bundle({
          name: 'lib',
          compile: true
        });
      })
      .then(function() {
        if(filter && !filter.bundles){
          return;
        }
        log('Exporting App Script...');
        return bundle({
          name: 'app'
        });
      });


    function bundle(optionsBundle) {
      let scripts = [];
      let target = `${optionsBundle.name}.js`;
      let sourcePath = path.join(outputDir, target);

      return Promise.resolve()
        .then(function() {
          let content = '';

          for (var script of project.config.scripts[
            optionsBundle.name
          ]) {
            scripts.push(script);
          }

          scripts = scripts.map(function(script){
            if(_.isString(script)){
              return {
                path: script
              };
            }
            return script;
          });

          scripts = _.uniqBy(scripts,'path');

          scripts = scripts.map(function(script){

            var scriptPath = script.path || script;

            if(script.name){
              content += `window.${script.name}=`;
            }

            content += `require('${scriptPath}');\n`;
          });

          return fs.outputFile(sourcePath, content);

        })
        .then(function(){

          if(!optionsBundle.compile){
            return;
          }
          var targetParsed = path.parse(target);

          return project.compiler.script.compile(target, {
            base: outputDir,
            output: outputDir,
            outputName: targetParsed.name+'.min'+targetParsed.ext,
          });
        });


    }

    function services() {

      var script = generator.services(app, {});
      var token = app.web.services.get('token');

      script = script.replace('$LoopBack$', `$${token.name}$`);

      var target = options.filename || 'services.js';
      var outputPath = path.join(outputDir, target);

      return Promise.resolve()
        .then(function() {
          return fs.outputFile(outputPath, script);
        })
        .then(function() {
          var targetParsed = path.parse(target);
          return project.compiler.script.compile(target, {
            base: outputDir,
            output: outputDir,
            outputName: targetParsed.name+'.min'+targetParsed.ext,
          });
        });
    }
  };

};
