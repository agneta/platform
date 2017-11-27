/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/server/remotes/process/logs.js
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

module.exports = function(Model, app) {

  Model.logs = function(name) {

    var log = app.process.logs[name];

    if (!log) {
      return Promise.reject({
        statusCode: 400,
        message: 'The name of the log is invalid'
      });
    }

    return Promise.resolve()
      .then(function() {

        return log.readLast();

      })
      .then(function(entries) {

        return {
          entries: entries
        };

      });

  };

  Model.remoteMethod(
    'logs', {
      description: 'Get application logs',
      accepts: [{
        arg: 'name',
        type: 'string',
        required: true
      }],
      returns: {
        arg: 'result',
        type: 'object',
        root: true
      },
      http: {
        verb: 'post',
        path: '/logs'
      }
    }
  );

};
