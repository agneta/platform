/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/utilities/build/index.js
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
var Promise = require('bluebird');

const dependencies = require('./dependencies');
const services = require('./services');

module.exports = function(util) {

  return {
    run: function(options) {

      options.type = options.type || {};

      return Promise.resolve()
        .then(function() {
          if (options.type.dependencies) {
            return dependencies(util);
          }
        })
        .then(function() {
          if (options.type.services) {
            return services(util);
          }
        })
        .then(function() {

          if (options.type.pages || options.type.assets) {

            if (!options.env) {
              return Promise.reject({
                message: 'The environment is required'
              });
            }

            var web = util.locals.web;

            return web.build({
              logger: util,
              progress: util.progress,
              env: options.env,
              config: {
                assets: options.type.assets,
                pages: options.type.pages
              }
            });

          }
        });

    },
    parameters: [{
      name: 'env',
      title: 'Environment',
      type: 'radio',
      if: 'type.pages||type.assets',
      values: [{
        name: 'local',
        title: 'Local'
      }, {
        name: 'staging',
        title: 'Staging'
      }, {
        name: 'production',
        title: 'Production'
      }]
    }, {
      name: 'type',
      title: 'What to build?',
      type: 'checkboxes',
      values: [{
        name: 'pages',
        title: 'Pages'
      }, {
        name: 'assets',
        title: 'Assets'
      }, {
        name: 'dependencies',
        title: 'Dependencies'
      }, {
        name: 'services',
        title: 'Services'
      }]
    }]
  };

};
