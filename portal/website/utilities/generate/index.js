/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/utilities/generate/index.js
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

  return {
    run: function(options) {

      options.type = options.type || {};

      return Promise.resolve()
        .then(function() {
          if (options.type.dependencies) {
            return require('./dependencies')(util);
          }
        })
        .then(function() {
          if (options.type.scripts) {
            return require('./scripts')(util, options);
          }
        });

    },
    parameters: [{
      name: 'type',
      title: 'What to generate?',
      type: 'checkboxes',
      values: [{
        name: 'dependencies',
        title: 'Dependencies'
      }, {
        name: 'scripts',
        title: 'Scripts'
      }]
    },
    {
      name: 'script',
      title: {
        en: 'Select what scripts to generate:'
      },
      if: 'type.scripts',
      type: 'checkboxes',
      values: [{
        name: 'bundles',
        title: {
          en: 'Bundles'
        }
      }, {
        name: 'services',
        title: {
          en: 'Services'
        }
      }]
    }
    ]
  };

};
