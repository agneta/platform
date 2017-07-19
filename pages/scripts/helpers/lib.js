/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/scripts/helpers/lib.js
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
const url = require('url');
const _ = require('lodash');
const urljoin = require('url-join');
const request = require('request-promise');
const chalk = require('chalk');
const LRU = require('lru-cache');

const cache = LRU({
  maxAge: 3 * 60 * 1000,
});

module.exports = function(locals) {

  var project = locals.project;

  project.extend.helper.register('get_lib', function(libPath) {

    var basePath;
    var local;

    switch (project.env) {
    case 'development':
      if (!locals.web && process.env.LIB_LOCAL) {
        local = true;
        basePath = this.url_for('lib');
      }
      break;
    }

    if (!basePath) {
      basePath = project.site.servers.lib;
    }

    var result = urljoin(basePath, libPath);

    if (!local) {

      if (!cache.get(result)) {

        cache.set(result, true);

        request({
          method: 'HEAD',
          uri: result
        })
          .catch(function(err) {
            console.log(chalk.bgRed('LIB_ERROR ' + err.statusCode), result);
          });
      }

    }

    return this.getVersion(result);

  });

};
