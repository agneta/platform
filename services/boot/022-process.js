/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/server/boot/022-process.js
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
const pm2 = Promise.promisifyAll(require('pm2'));

module.exports = function(app) {

  if (app.get('options').web) {
    return;
  }

  if(process.env.MODE == 'terminal'){
    return;
  }

  var processName = 'agneta';

  app.process = {
    describe: function() {
      return pm2.describeAsync(processName);
    },
    restart: function() {
      return pm2.restartAsync(processName);
    }
  };


  return Promise.resolve()

    .then(function() {
      return require('./process/init')(app);
    })

    .then(function() {
      return require('./process/logs')(app);
    });



};
