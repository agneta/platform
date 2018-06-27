/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/boot/email/compiler.js
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
const _ = require('lodash');
const yaml = require('js-yaml');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs-extra');
const Promise = require('bluebird');
const mjml = require('mjml');

module.exports = function(initOptions) {
  var helpers = initOptions.helpers;
  var email = initOptions.email;
  var templates = initOptions.templates;
  var dataMain = initOptions.dataMain;
  var StyleCompiler = require('./style')(initOptions);

  return function(options) {
    var pathTemplate = options.pathTemplate;
    var templateData;
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
        return fs.readFile(path.join(pathTemplate, 'data.yml'));
      })
      .then(function(dataContent) {
        templateData = yaml.safeLoad(dataContent);
        var templateHtmlPath = helpers.getPath('_layout/layout.ejs');
        templateData.templatePath = `${templateDir}/html`;
        return fs.readFile(templateHtmlPath, 'utf8');
      })
      .then(function(templateContent) {
        //console.log('templateContent',templateContent);
        var renderer = ejs.compile(templateContent);

        var template = {
          name: templateDir,
          renderer: renderer,
          data: templateData,
          render: function(data) {
            var renderData = _.extend({}, dataMain, templateData, data);

            return Promise.resolve()
              .then(function() {
                console.log(renderData);

                return StyleCompiler({
                  templateDir: templateDir,
                  data: renderData
                });
              })
              .then(function(styleCompiler) {
                renderData.style = styleCompiler.render();
                let html = renderer(_.extend(renderData, helpers));
                let mjmlResult = mjml(html);

                if (mjmlResult.errors.length) {
                  console.error(mjmlResult.errors);
                  throw new Error('MJML compiler has an error');
                }

                html = mjmlResult.html;

                return {
                  html: html,
                  text: email.text(html)
                };
              });
          }
        };

        templates[templateDir] = template;

        return template;
      });
  };
};
