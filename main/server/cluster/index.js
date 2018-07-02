/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: main/server/cluster/index.js
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
const path = require('path');
const express = require('express');
const SocketCluster = require('socketcluster');

//var workerCount = process.env.WEB_CONCURRENCY || 1;
// TODO: Make more stable the multiple workers

module.exports = function(options) {
  var socketPath = '/socket';
  process.env.PATH_SOCKET = process.env.PATH_SOCKET || socketPath;

  //---------------------------------------------------
  // HTTP connections to redirect to HTTPS

  var http = express();

  http.get('*', function(req, res) {
    res.redirect('https://' + req.headers['host'] + req.url);
  });

  http.listen(process.env.PORT_HTTP);

  //---------------------------------------------------
  // HTTPS connections with socket cluster
  var clusterOptions = {
    workers: 1,
    brokers: 1,
    port: process.env.PORT,
    protocol: process.env.PROTOCOL,
    path: socketPath,
    wsEngine: 'uws',
    rebootWorkerOnCrash: true,
    environment: 'prod',
    workerController: path.join(__dirname, 'worker.ts'),
    logLevel: 3,
    protocolOptions: options.protocolOptions
  };

  var socketCluster = new SocketCluster(clusterOptions);

  return require('./master')
    .run(socketCluster)
    .then(function(result) {
      return {
        port: process.env.PORT,
        result: result
      };
    });
};
