// Extend lodash
var _ = require('lodash');
_.mixin(require('lodash-deep'));

const url = require('url');
const Promise = require('bluebird');
//---------------------------------------------------
// Look for server certificates

var options = {};
var protocol = 'http';
var port = 8080;

module.exports = Promise.resolve()
  .then(function() {

    if (
      !process.env.SERVER_KEY &&
      !process.env.SERVER_CERT &&
      !process.env.CA_CERT
    ) {
      return;
    }

    var protocolOptions = {
      key: process.env.SERVER_KEY.replace(/\\n/g,'\n'),
      cert: process.env.SERVER_CERT.replace(/\\n/g,'\n'),
      ca: process.env.CA_CERT.replace(/\\n/g,'\n'),
      requestCert: true,
      rejectUnauthorized: false
    };
    //throw 'test';

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    options.protocolOptions = protocolOptions;

    protocol = 'https';

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

    console.log('MODE',process.env.MODE);

    switch (process.env.MODE) {
      case 'sftp':
        server = require('./sftp');
        break;
      default:
        server = require('./cluster');
        break;
    }

    return server(options);

  })
  .catch(function(err) {
    console.error(err);
  });
