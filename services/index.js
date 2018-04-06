/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/index.js
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
const loopback = require('loopback');
const path = require('path');
const boot = require('loopback-boot');
const modelDefinitions = require('./model-definitions');
const modelGenerator = require('./model-generator');
const disableAllMethods = require('./lib/disableAllMethods');

module.exports = function(options) {

  options = options || {};
  var app = options.app || loopback();
  app.httpServer = options.server;
  options.app = app;

  //-------------------------------------------------------

  require('./lib/secrets')(app, options);
  require('./lib/moment');
  require('./lib/log')(app);
  require('./lib/gis')(app);
  require('./lib/require')(app);

  //-------------------------------------------------------

  app.set('view engine', 'ejs');
  app.set('json spaces', 2);
  app.set('trust proxy', 1);
  app.set('views', path.resolve(__dirname, 'views'));

  //-------------------------------------------------------

  return {
    locals: options,
    init: function() {
      app.client = options.client;
      app.web = options.web;
      require('./lib/locals')(app, options);
      require('./lib/language')(app);

      require('./lib/socket')({
        appOptions: options,
        app: app,
      });

      return Promise.resolve();

    },
    start: function() {

      if (options.building) {
        return;
      }

      var modelConfig = {
        models: app.configurator.load('model-config'),
        modelDefinitions: [],
        _definitions: {}
      };

      require('./lib/form')(app);
      require('./lib/edit')(app);

      return Promise.resolve()
        .then(function() {
          return modelGenerator(app, modelConfig);
        })
        .then(function() {
          return modelDefinitions(app, modelConfig);
        })
        .then(function() {
          app.modelConfig = modelConfig.models;
          return new Promise(function(resolve, reject) {

            var middleware = app.configurator.load('middleware', true);
            //console.log(middleware);
            //console.log(modelConfig.modelDefinitions);

            var bootDirs = [
              path.join(__dirname, 'boot'),
              path.join(app.get('services_dir'), 'boot')
            ];

            bootDirs = bootDirs.concat(
              options.include.map(function(dir){
                return path.join(dir,'boot');
              })
            );

            var bootOptions = {
              appRootDir: __dirname,
              models: modelConfig.models,
              modelDefinitions: modelConfig.modelDefinitions,
              middleware: middleware,
              dataSources: app.configurator.load('datasources'),
              bootDirs: bootDirs
            };

            boot(app, bootOptions, function(err) {
              if (err) {
                reject(err);
                return;
              }
              app.models().forEach(function(model){
                disableAllMethods(model);
              });
              app.indexes.updateDatasources(['db', 'db_prd']);
              app.emit('booted');
              resolve();
            });
          });
        });
    }
  };
};
