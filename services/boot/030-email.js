const path = require('path');
const Promise = require('bluebird');
const _ = require('lodash');
const yaml = require('js-yaml');
const fs = require('fs-extra');
const htmlToText = require('html-to-text');

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
    project.paths.theme.email,
    project.paths.app.email
  ];

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
    },{
      concurrency: 1
    })
      .then(function() {
        email.templates = templates;
        return email;
      });

  }


};
