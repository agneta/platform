/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: main/cluster/master.js
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
const cluster = require('cluster');

module.exports.run = function(socketCluster) {

  return new Promise(function(resolve) {

    socketCluster.on('ready', function() {
      console.log('Listening');
    });

    socketCluster.on('workerMessage', function(workerId, msg) {
      if (msg.started) {
        resolve();
      }
      if (msg.restart) {
        console.log('TODO: restart apps');
        sendStatus();
      }
    });

    socketCluster.on('workerStart', function() {
      sendStatus();
    });

    function sendStatus() {

      var result = [];
      var id;
      var worker;

      for (id in cluster.workers) {
        worker = cluster.workers[id];
        result.push({
          id: worker.id,
          connected: worker.isConnected(),
          dead: worker.isDead()
        });
      }

      for (id in cluster.workers) {
        worker = cluster.workers[id];
        if (worker.isConnected()) {
          worker.send({
            workers: result
          });
        }
      }

    }

  });

};
