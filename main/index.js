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
require('sharp');

const os = require('os');
const config = require('./config');
const path = require('path');
const SocketCluster = require('socketcluster')
  .SocketCluster;

//var workerCount = process.env.WEB_CONCURRENCY || 1;
// TODO: Make more stable the multiple workers

var workerCount = 1;
var port = config.port;

//-------------------------------------------------

workerCount = workerCount || os.cpus()
  .length;
console.log(`Starting ${workerCount} workers`);

//-------------------------------------------------

var environment = process.env.NODE_ENV;

switch (environment) {
  case 'production':
    environment = 'prod';
    break;
  default:
    environment = 'dev';
    break;
}

var options = {
  workers: workerCount,
  port: port,
  path: config.socket.path,
  workerController: path.join(__dirname, 'cluster', 'worker'),
  environment: environment
};

var socketCluster = new SocketCluster(options);
module.exports = require('./cluster/master')
  .run(socketCluster)
  .then(function(result){
    return {
      port: port,
      result: result
    };
  });
