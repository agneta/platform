/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/server/server.js
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
var loopback = require('loopback');
var path = require('path');
var boot = require('loopback-boot');
var modelDefinitions = require('./model-definitions');
var bootGenerator = require('./boot-generator');

module.exports = function(options) {

  options = options || {};
  var app = options.app || loopback();
  app.httpServer = options.server;
  options.app = app;

  //-------------------------------------------------------

  require('../lib/secrets')(app,options);
  require('../lib/moment');
  require('../lib/helpers')(app);
  require('../lib/log')(app);
  require('../lib/gis')(app);
  require('../lib/require')(app);

  //-------------------------------------------------------

  app.set('view engine', 'ejs');
  app.set('json spaces', 2);
  app.set('trust proxy', 1);
  app.set('views', path.resolve(__dirname, 'views'));

  //-------------------------------------------------------

  return {
    locals: options,
    init: function() {

      require('../lib/locals')(app, options);

      if (!options.disableSocket) {
        require('../lib/socket')({
          worker: options.worker,
          app: app
        });
      }

      return Promise.resolve();

    },
    start: function() {

      if (options.building) {
        return;
      }

      var bootGenerated = bootGenerator(app, {
        models: app.configurator.load('model-config'),
        modelDefinitions: [],
        _definitions: {}
      });

      return modelDefinitions(app, bootGenerated)
        .then(function() {
          return new Promise(function(resolve, reject) {

            var bootOptions = {
              appRootDir: __dirname,
              models: bootGenerated.models,
              modelDefinitions: bootGenerated.modelDefinitions,
              middleware: app.configurator.load('middleware',true),
              dataSources: app.configurator.load('datasources'),
              bootDirs: [
                path.join(__dirname, 'boot'),
                path.join(app.get('services_dir'), 'boot')
              ]
            };

            boot(app, bootOptions, function(err) {
              if (err) {
                reject(err);
                return;
              }
              app.indexes.updateDatasources(['db', 'db_prd']);
              app.emit('booted');
              resolve();
            });
          });
        });
    }
  };
};
