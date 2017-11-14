/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: main/server/cluster/master.js
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

module.exports.run = function(socketCluster) {
  return new Promise(function(resolve) {

    socketCluster.on('ready', function() {
      console.log('Listening');
    });

    socketCluster.on('fail', console.error);
    socketCluster.on('warning', console.warn);

    socketCluster.on('workerMessage', function(workerId, msg) {

      if (msg.started) {
        resolve(msg.result);
      }

    });

  });

};
