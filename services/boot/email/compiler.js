const _ = require('lodash');
const yaml = require('js-yaml');
const juice = require('juice');
const stylus = require('stylus');
const nib = require('nib');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs-extra');
const Promise = require('bluebird');

module.exports = function(initOptions) {

  var helpers = initOptions.helpers;
  var email = initOptions.email;
  var templates = initOptions.templates;
  var dataMain = initOptions.dataMain;
  var project = initOptions.project;

  return function(options){
    var pathTemplate = options.pathTemplate;

    var templateData;
    var templateStyle;
    var templateDir = path.parse(pathTemplate).name;

    var stats = fs.statSync(pathTemplate);

    if (!stats.isDirectory()) {
      return;
    }

    if (templateDir[0] == '_') {
      return;
    }

    return Promise.resolve()
      .then(function() {

        var layoutStylePath = helpers.getPath('_layout/style.styl');
        if(!layoutStylePath){
          throw new Error('Could not find a layout style');
        }
        var templateStylePath = helpers.getPath(
          path.join(templateDir, 'style.styl')
        );

        if(!templateStylePath){
          templateStylePath = layoutStylePath;
        }

        return fs.readFile(templateStylePath,'utf8')
          .then(function(content){
            var compiler =  stylus(content)
              .set('filename', templateStylePath);

            if(templateStylePath != layoutStylePath){
              compiler.import(layoutStylePath);
            }

            return compiler;
          });
      })
      .then(function(styleCompiler){

        styleCompiler.define('theme', function(params) {
          var themePath = path.join(project.paths.theme.email, params.val);
          return new stylus.nodes.String(themePath);
        });

        styleCompiler.use(nib())
          .import('nib')
          .import(helpers.getPath('_layout/variables.styl'))
          .set('include css', true);

        templateStyle = styleCompiler.render();

        return fs.readFile(path.join(pathTemplate, 'data.yml'));
      })
      .then(function(dataContent) {
        templateData = yaml.safeLoad(dataContent);

        var templateHtmlPath = path.join(pathTemplate, 'html.ejs');
        //console.log('templateHtmlPath',templateHtmlPath);
        return fs.readFile(templateHtmlPath,'utf8');
      })
      .then(function(templateContent) {
      //console.log('templateContent',templateContent);
        var renderer = ejs.compile(
          templateContent
        );

        templates[templateDir] = {
          renderer: renderer,
          data: templateData,
          render: function(data) {

            var html = renderer(_.extend({}, dataMain, templateData, data, helpers));

            html = juice.inlineContent(html, templateStyle);

            return {
              html: html,
              text: email.text(html)
            };

          }
        };
      });

  };
};
