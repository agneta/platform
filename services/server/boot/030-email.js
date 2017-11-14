/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/server/boot/030-email.js
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
  var templatePaths = [
    path.join(__dirname, '../../templates'),
    path.join(project.paths.project, 'email')
  ];

  return Promise.map(templatePaths, function(pathTemplates) {

    var templateDirs = fs.readdirSync(pathTemplates);
    var dataPath = path.join(pathTemplates, '_data.yml');

    if (fs.existsSync(dataPath)) {

      _.merge(dataMain,
        yaml.safeLoad(fs.readFileSync(dataPath, 'utf8'))
      );

    }

    var helpers = {
      partial: function(path_partial, data) {

        var file_path = path.join(pathTemplates, path_partial + '.ejs');
        var file_content = fs.readFileSync(file_path, 'utf8');

        data = _.extend({}, this, data);

        return ejs.render.apply(this, [file_content, data]);
      },
      lng: function(obj) {
        if (!obj) {
          return;
        }
        if (_.isString(obj)) {
          return obj;
        }
        return obj[this.language] || obj.en || obj.gr;
      }
    };

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
      var templateStylePath = path.join(pathTemplate, 'style.stylus');

      return fs.readFile(templateStylePath,'utf8')
        .then(function(content){

          templateStyle = stylus(content)
            .set('filename', templateStylePath)
            .set('include css', true)
            .render();

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
