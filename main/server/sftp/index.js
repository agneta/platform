const SFTPServer = require('./server');
const path = require('path');
const services = require('../services');
const auth = require('./auth');
const fs = require('fs-extra');
module.exports = function(options) {

  var server;
  var tmpDir = path.join(process.cwd(), 'tmp', 'sftp');
  var app;

  fs.ensureDir(tmpDir)
    .then(services)
    .then(function(result) {
      app = result.services.app;
      server = new SFTPServer({
        privateKey: options.protocolOptions.key,
        temporaryFileDirectory: tmpDir
      });
    })
    .then(function() {

      auth(server, app);
      // User disconnects from the server
      server.on('end', function() {
        console.log('user disconnected');
      });

      //
      server.on('error', function(error) {
        console.error(error);
      });

      server.listen(process.env.PORT);

      console.log('SFTP is listening to port', process.env.PORT);

    });

  //delete private key

};
