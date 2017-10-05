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

    var protocolOptions = {
      key: process.env.SERVER_KEY,
      cert: process.env.SERVER_CERT,
      ca: process.env.CA_CERT,
      requestCert: true,
      rejectUnauthorized: false
    };

    delete process.env.SERVER_KEY;
    delete process.env.SERVER_CERT;
    delete process.env.CA_CERT;

    var files = [];

    if (!protocolOptions.key) {
      files.push({
        name: 'server-key.pem',
        key: 'key'
      });
    }

    if (!protocolOptions.cert) {
      files.push({
        name: 'server-crt.pem',
        key: 'cert'
      });
    }

    if (!protocolOptions.ca) {
      files.push({
        name: 'ca-crt.pem',
        key: 'ca'
      });
    }

    return Promise.mapSeries(files, function(file) {
      return fs.readFile(
        path.join(certDir, file.name)
      ).then(function(content) {
        protocolOptions[file.key] = content;
      });
    })
      .then(function() {

        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        options.protocolOptions = protocolOptions;

        protocol = 'https';

      });
  })
  .then(function() {

    //---------------------------------------------------
    // Set environment variables

    process.env.HOST_NAME = process.env.HOST_NAME || 'localhost';
    process.env.PORT = process.env.PORT || port;
    process.env.MODE = process.env.MODE || 'portal';

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
  .catch(function(err) {
    console.error(err);
  });
