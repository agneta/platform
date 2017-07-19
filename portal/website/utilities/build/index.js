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

module.exports = function(util) {

  var project = util.locals.project;

  return {
    run: function(options) {
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
          assets: true,
          pages: true
        }
      });

    },
    parameters: [{
      name: 'env',
      title: 'Environment',
      type: 'radio',
      values: [{
        name: 'local',
        title: 'Local'
      },{
        name: 'staging',
        title: 'Staging'
      }, {
        name: 'production',
        title: 'Production'
      }]
    }]
  };

};
