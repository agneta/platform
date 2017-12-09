/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: main/index.js
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
const pm2 = require('pm2');
const path = require('path');
const version = require('./version');
const Promise = require('bluebird');

Promise.resolve()
  .then(function() {
    return version();
  })
  .then(function() {
    return Promise.promisify(pm2.connect)();
  })
  .then(function() {

    var name = 'agneta';
    var base = path.join(process.env.HOME, '.pm2/logs');
    var outputPath = path.join(base, `${name}-output.log`);
    var errorPath = path.join(base, `${name}-error.log`);

    return Promise.promisify(pm2.start)({
      name: name,
      script: path.join(__dirname, 'server', 'index.js'),
      exec_mode: 'fork',
      logDateFormat: '>> YYYY-MM-DD HH:mm:ss Z :',
      max_memory_restart: '400M',
      output: outputPath,
      error: errorPath
    });
  })
  .catch(function(err) {
    console.error(err);
    process.exit(2);
  });
