/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/boot/socket/memory.js
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
var prettyBytes = require('pretty-bytes');
var _ = require('lodash');

module.exports = function(app) {

  var socket = app.portal.socket;
  var memoryLimit = 512;

  function memoryUsage() {
    setTimeout(function() {

      var usage = process.memoryUsage();

      usage = _.pick(usage, ['rss', 'heapTotal', 'heapUsed']);
      var keys = _.keys(usage);

      usage = _.zipObject(keys, _.map(keys, function(key) {
        var value = usage[key];
        return {
          value: value,
          title: prettyBytes(value),
          percentage: ((value / (1024 * 1024)).toFixed(2) / memoryLimit).toFixed(2)
        };
      }));

      socket.emit('memory:update', {
        usage: usage,
        limit: memoryLimit
      });

      memoryUsage();
    }, 5000);
  }

  memoryUsage();


};
