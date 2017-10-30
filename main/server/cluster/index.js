const os = require('os');
const path = require('path');
const express = require('express');
const SocketCluster = require('socketcluster')
  .SocketCluster;

//var workerCount = process.env.WEB_CONCURRENCY || 1;
// TODO: Make more stable the multiple workers


module.exports = function(options) {

  var workerCount = 1;
  workerCount = workerCount || os.cpus()
    .length;
  console.log(`Starting ${workerCount} workers`);

  //-------------------------------------------------

  var socketPath = '/socket';
  process.env.PATH_SOCKET = process.env.PATH_SOCKET || socketPath;

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
  // HTTP connections to redirect to HTTPS

  var http = express();

  http.get('*', function(req, res) {
    res.redirect('https://' + req.headers['host'] + req.url);
  });

  http.listen(process.env.PORT_HTTP);

  //---------------------------------------------------
  // HTTPS connections with socket cluster

  var clusterOptions = {
    workers: workerCount,
    port: process.env.PORT,
    protocol: process.env.PROTOCOL,
    path: socketPath,
    workerController: path.join(__dirname, 'worker.js'),
    environment: environment,
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
