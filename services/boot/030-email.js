/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/boot/030-email.js
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
const path = require('path');
const ejs = require('ejs');
const Promise = require('bluebird');
const _ = require('lodash');
const yaml = require('js-yaml');
const fs = require('fs-extra');
const htmlToText = require('html-to-text');
const juice = require('juice');
const stylus = require('stylus');
const nib = require('nib');

module.exports = function(app) {

  var project = app.get('options');
  project = project.web || project.client;
  project = project.project;

  var email = app.get('email');

  if (!email) {
    email = {};
    app.set('email', email);
  }
  var templates = {};

  email.text = function(html) {

    return htmlToText.fromString(html, {
      ignoreImage: true,
      ignoreHref: true,
      tables: ['.data'],
      wordwrap: 80
    });
  };

  //////////////////////////////////////////////////////////////////////
  // Load Email Templates
  //////////////////////////////////////////////////////////////////////

  var dataMain = {};
  var themeDir = path.join(__dirname, '../templates');
  var templatePaths = [
    path.join(project.paths.core.project, 'email'),
    themeDir
  ];

  var helpers = require('./email/helpers')({
    templatePaths: templatePaths
  });

  return Promise.map(templatePaths, function(pathTemplates) {

    var templateDirs = fs.readdirSync(pathTemplates);
    var dataPath = path.join(pathTemplates, '_data.yml');

    if (fs.existsSync(dataPath)) {

      _.merge(dataMain,
        yaml.safeLoad(fs.readFileSync(dataPath, 'utf8'))
      );

    }

    return Promise.map(templateDirs, function(templateDir) {

      var pathTemplate = path.join(pathTemplates, templateDir);

      var stats = fs.statSync(pathTemplate);

      if (!stats.isDirectory()) {
        return;
      }

      if (templateDir[0] == '_') {
        return;
      }

      var templateData;
      var templateStyle;

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
            var themePath = path.join(themeDir, params.val);
            return new stylus.nodes.String(themePath);
          });

          styleCompiler.use(nib())
            .import('nib')
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
    });
  })
    .then(function() {

      email.templates = templates;
      return email;

    });
};
