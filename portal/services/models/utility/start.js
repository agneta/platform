/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/models/utility/start.js
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

module.exports = function(Model) {

  Model.start = function(name, options) {
    var instance;
    var utility;
    return Model.getUtility(name)
      .then(function(_utility) {

        utility = _utility;
        instance = utility.instance;

        if (instance.status.running) {
          return Promise.reject({
            statusCode: 400,
            message: 'Instance is already running'
          });
        }
      })
      .then(function() {

        var promise = instance.run(options)
          .catch(function(error) {
            utility.addLine({
              message: [error.message, error.stack].join('\n'),
              type: 'error'
            });
          })
          .finally(function() {
            instance.status.running = false;
            utility.emit('status', instance.status);
          });

        instance.promise = promise;
        instance.status.running = true;

        utility.emit('status', instance.status);
        utility.emit('notify', {
          message: `Utility ${name} has started`
        });

        return Promise.resolve({
          message: 'The utility has started'
        });

      });


  };

  Model.remoteMethod(
    'start', {
      description: 'Start a utility',
      accepts: [{
        arg: 'name',
        type: 'string',
        required: true
      }, {
        arg: 'options',
        type: 'object',
        required: false
      }],
      returns: {
        arg: 'result',
        type: 'object',
        root: true
      },
      http: {
        verb: 'post',
        path: '/start'
      }
    }
  );

};
