/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/utilities/bower.js
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
var bower = require('bower');
var cli = require('bower/lib/util/cli');
var Promise = require('bluebird');

module.exports = function(util, path) {
  var originalDir = process.cwd();
  process.chdir(path);

  var logger = bower.commands.install();
  logger.on('log', function(log) {
    //renderer.log(log);
    util.log('[bower] ' + log.id + ' ' + log.message);
  });

  return new Promise(function(resolve, reject) {
    cli.getRenderer('install', logger.json, bower.config);

    logger.once('end', function(data) {
      resolve(data);
    });
    logger.once('error', function(err) {
      reject(err);
    });
  })
    .then(function() {
      process.chdir(originalDir);
    });
};
