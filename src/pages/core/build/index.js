/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/core/build/index.js
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
const deleteEmpty = Promise.promisify(require('delete-empty'));
const ProgressBar = require('progress');

const buildAssets = require('./assets');
const buildPages = require('./pages');
const exportFile = require('./export');

module.exports = function(locals) {

  return function(options) {

    options = options || {};
    options.logger = options.logger || console;
    options.progress = options.progress || function(length) {
      return new ProgressBar('[:bar] :percent', {
        total: length
      });
    };

    var config = options.config || locals.buildOptions;

    return Promise.resolve()
      .then(function() {

        exportFile(locals);

        if (config.assets) {
          return buildAssets(locals, options);
        }

      })
      .then(function() {

        if (config.pages) {
          return buildPages(locals, options);
        }

      })
      .then(function() {

        return deleteEmpty(locals.build_dir);

      })
      .then(function() {

        options.logger.success('Building Complete!');

      });

  };
};
