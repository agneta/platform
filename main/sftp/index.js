const SFTPServer = require('node-sftp-server');
const path = require('path');
const fs = require('fs-extra');
const services = require('../server/services');
const auth = require('./auth');

module.exports = function(options) {

  var server;
  var keyPath = path.join(process.cwd(), 'tmp', 'private.key');
  var tmpDir = path.join(process.cwd(), 'tmp', 'sftp');

  return services()
    .then(function() {
      console.log(arguments);
      return fs.outputFile(keyPath, options.protocolOptions.key);
    })
    .then(function() {
      server = new SFTPServer({
        privateKeyFile: keyPath,
        temporaryFileDirectory: tmpDir
      });
      return fs.remove(keyPath);
    })
    .then(function() {

      auth(server);
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
