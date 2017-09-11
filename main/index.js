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

const url = require('url');
const Promise = require('bluebird');
const os = require('os');
const fs = require('fs-extra');
const path = require('path');
const SocketCluster = require('socketcluster')
  .SocketCluster;

//var workerCount = process.env.WEB_CONCURRENCY || 1;
// TODO: Make more stable the multiple workers

var workerCount = 1;

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

//---------------------------------------------------
// Look for server certificates

var certDir = path.join(process.cwd(), 'services', 'certificates');
var protocolOptions;
var protocol = 'http';
var port = 8080;
var socketPath = '/socket';

fs.pathExists(certDir)
  .then(function(exists) {

    if (!exists) {
      return;
    }

    var files = [
      'server-key.pem',
      'server-crt.pem',
      'ca-crt.pem'
    ];

    return Promise.mapSeries(files, function(file) {
      return fs.readFile(
        path.join(certDir, file)
      );
    })
      .then(function(certs) {

        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

        protocolOptions = {
          key: certs[0],
          cert: certs[1],
          ca: certs[2],
          requestCert: true,
          rejectUnauthorized: false
        };

        protocol = 'https';

      });
  })
  .then(function() {

    //---------------------------------------------------
    // Set environment variables

    process.env.HOST_NAME = process.env.HOST_NAME || 'localhost';
    process.env.PORT = process.env.PORT || port;


    process.env.ENDPOINT = process.env.ENDPOINT ||
      url.format({
        protocol: protocol,
        hostname: process.env.HOST_NAME,
        port: process.env.PORT
      });

    process.env.NODE_ENV = process.env.NODE_ENV || 'development';
    process.env.PROTOCOL = protocol;
    process.env.PATH_SOCKET = process.env.PATH_SOCKET || socketPath;

    //---------------------------------------------------

    var options = {
      workers: workerCount,
      port: port,
      protocol: protocol,
      path: socketPath,
      workerController: path.join(__dirname, 'cluster', 'worker'),
      environment: environment,
      protocolOptions: protocolOptions
    };

    var socketCluster = new SocketCluster(options);
    module.exports = require('./cluster/master')
      .run(socketCluster)
      .then(function(result) {
        return {
          port: port,
          result: result
        };
      });

  });
