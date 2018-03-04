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
const Promise = require('bluebird');
const _ = require('lodash');
const yaml = require('js-yaml');
const fs = require('fs-extra');
const htmlToText = require('html-to-text');

module.exports = function(app) {

  var options = app.get('options');
  var project = options.web || options.client;
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
    project.paths.theme.email,
    project.paths.app.email
  ];

  for(var name in project.paths.app.extensions){
    var extPaths = project.paths.app.extensions[name];
    templatePaths.push(extPaths.email);
  }
  //console.log(templatePaths);

  const helpers = require('./email/helpers')({
    templatePaths: _.reverse([].concat(templatePaths)),
    app: app
  });
  const compiler = require('./email/compiler')({
    helpers: helpers,
    email: email,
    templates: templates,
    dataMain: dataMain,
    project: project
  });

  email.compiler = compiler;
  email.templatePaths = templatePaths;
  email.reloadAll = reloadAll;

  return reloadAll();

  function reloadAll(){

    return Promise.mapSeries(templatePaths, function(pathTemplates) {

      return fs.ensureDir(pathTemplates)
        .then(function() {
          var templateDirs = fs.readdirSync(pathTemplates);
          var dataPath = path.join(pathTemplates, '_layout', 'data.yml');

          if (fs.existsSync(dataPath)) {
            _.merge(dataMain,
              yaml.safeLoad(fs.readFileSync(dataPath, 'utf8'))
            );

          }

          return Promise.map(templateDirs, function(templateDir) {

            return compiler({
              pathTemplate: path.join(pathTemplates, templateDir)
            });

          });

        });

    },{
      concurrency: 1
    })
      .then(function() {
        email.templates = templates;
        return email;
      });

  }


};
