const stylus = require('stylus');
const nib = require('nib');
const path = require('path');
const fs = require('fs-extra');
const Promise = require('bluebird');
const _ = require('lodash');

module.exports = function(initOptions) {
  var project = initOptions.project;
  var helpers = initOptions.helpers;
  var compiler;

  return function(options) {
    var templateDir = options.templateDir;
    var layoutStylePath;
    var templateStylePath;

    return Promise.resolve()
      .then(function() {
        layoutStylePath = helpers.getPath('_layout/style.styl');
        if (!layoutStylePath) {
          throw new Error('Could not find a layout style');
        }
        templateStylePath = helpers.getPath(
          path.join(templateDir, 'style.styl')
        );

        if (!templateStylePath) {
          templateStylePath = layoutStylePath;
        }

        return fs.readFile(templateStylePath, 'utf8');
      })
      .then(function(content) {
        return stylus(content).set('filename', templateStylePath);
      })
      .then(function(_compiler) {
        compiler = _compiler;
        compiler.define('theme', function(params) {
          var themePath = path.join(project.paths.theme.email, params.val);
          return new stylus.nodes.String(themePath);
        });

        compiler.define('data', function(params) {
          //console.log('data', options.data, params.value);

          return new stylus.nodes.Literal(_.get(options.data, params.val));
        });

        compiler
          .use(nib())
          .import('nib')
          .import(helpers.getPath('_layout/variables.styl'))
          .set('include css', true);

        if (templateStylePath != layoutStylePath) {
          compiler.import(layoutStylePath);
        }

        return compiler;
      });
  };
};
