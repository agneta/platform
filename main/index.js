require('sharp');

// Extend lodash
var _ = require('lodash');
_.mixin(require('lodash-deep'));

const url = require('url');
const Promise = require('bluebird');
const fs = require('fs-extra');
const path = require('path');
//---------------------------------------------------
// Look for server certificates

var certDir = path.join(process.cwd(), 'services', 'certificates');
var options = {};
var protocol = 'http';
var port = 8080;

module.exports = fs.pathExists(certDir)
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

        options.protocolOptions = {
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

  })
  .then(function() {

    var server;

    switch (process.env.MODE) {
      case 'sftp':
        server = require('./sftp');
        break;
      default:
        server = require('./cluster');
        break;
    }

    server(options);

  })
  .catch(function(err){
    console.error(err);
  });
