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
const express = require('express');
const io = require('socket.io')(3000);
const redis = require('socket.io-redis');
const chalk = require('chalk');

module.exports = function(options) {
  var socketPath = '/socket';
  process.env.PATH_SOCKET = process.env.PATH_SOCKET || socketPath;

  //---------------------------------------------------
  // HTTP connections to redirect to HTTPS

  var http = express();

  http.get('*', function(req, res) {
    let host = req.headers['host'];
    if (host.indexOf('localhost:') === 0) {
      host = `localhost:${process.env.PORT}`;
    }

    res.redirect('https://' + host + req.url);
  });

  //---------------------------------------------------
  // HTTPS connections with socket cluster

  const io = require('socket.io')({
    path: socketPath,
    serveClient: false
  });

  // either
  const https = require('https').createServer(options.protocolOptions);

  io.attach(https, {
    pingInterval: 10000,
    pingTimeout: 5000,
    cookie: false
  });

  return require('./worker')({
    server: https,
    io: io
  }).then(function(result) {
    console.log(result);
    var redisOptions = result.services.secrets.get('redis');
    io.adapter(redis(redisOptions));

    http.listen(process.env.PORT_HTTP);
    https.listen(process.env.PORT);

    console.log(chalk.bold.green('Application is available'));
    console.log(`HTTPS port: ${process.env.PORT}`);
    console.log(`HTTP port: ${process.env.PORT_HTTP}`);

    return {
      port: process.env.PORT,
      result: result
    };
  });
};
