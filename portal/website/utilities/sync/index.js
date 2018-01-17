/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/utilities/sync/index.js
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
module.exports = function(util) {
  return {
    run: function(parameters) {

      parameters.options = parameters.options || {};

      require('./media')(util, parameters);
      require('./pages')(util, parameters);
      require('./data')(util, parameters);
    },
    parameters: [{
      name: 'options',
      title: 'Options',
      type: 'checkboxes',
      values: [{
        name: 'media',
        title: 'Media'
      },
      {
        name: 'pages',
        title: 'Pages'
      }, {
        name: 'data',
        title: 'Data'
      }
      ]
    }]
  };
};
