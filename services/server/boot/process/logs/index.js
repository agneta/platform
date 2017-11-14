/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/server/boot/process/logs/index.js
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
const Tail = require('./tail');
const Promise = require('bluebird');

module.exports = function(app) {

  var logs = app.process.logs = {};
  var names = ['output', 'error'];

  return require('./rotate')(app)
    .then(function() {

      return Promise.map(names, function(name) {
        var log = Tail(logs.file[name]);
        log.watch();

        log.emitter.on('change', function(result) {
          if (!app.models.Process.io) {
            return;
          }
          app.models.Process.io.emit(`logs:change:${name}`, result);
        });

        logs[name] = log;
      });


    });
};
