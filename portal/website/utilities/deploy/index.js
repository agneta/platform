/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/utilities/deploy/index.js
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

const Promise = require('bluebird');

module.exports = function(util) {

  var media = require('./media')(util);
  var pages = require('./pages')(util);
  var services = require('./services')(util);
  var search = require('./search')(util);

  return {
    run: function(options) {

      options.source = options.source || {};
      options.target = options.target || {};

      return Promise.resolve()
        .then(function() {
          return pages(options);
        })
        .then(function() {
          return media(options);
        })
        .then(function() {
          return search(options);
        })
        .then(function() {
          return services(options);
        })
        .then(function() {
          util.success('Deploy is complete');
        });

    },
    parameters: require('./parameters'),
    confirm:{
      title: 'Are you want to proceed with the following parameters?',
      message: '{{parameters}}'
    }
  };

};
