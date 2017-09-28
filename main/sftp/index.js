const SFTPServer = require('node-sftp-server');
const path = require('path');
const fs = require('fs-extra');
const sessionHandler = require('./session');
const services = require('../server/services');
const ssh2 = require('ssh2');
const utils = ssh2.utils;
const crypto = require('crypto');
const buffersEqual = require('buffer-equal-constant-time');

module.exports = function(options) {

  var server;
  var keyPath = path.join(process.cwd(), 'tmp', 'private.key');
  var tmpDir = path.join(process.cwd(), 'tmp', 'sftp');

  var pubKey = fs.readFileSync(
    path.join(process.cwd(), 'tmp','rsa_test.pub')
  );
  pubKey = utils.genPublicKey(utils.parseKey(pubKey));
  //write private key

  return services()
    .then(function() {
      return fs.outputFile(keyPath, options.protocolOptions.key);
    })
    .then(function() {
      server = new SFTPServer({
        privateKeyFile: keyPath,
        temporaryFileDirectory: tmpDir
      });
      //return fs.remove(keyPath);
    })
    .then(function() {


      server.on('connect', function(context) {

        //console.log('user attempting to connect', context.ctx, info);
        //console.log('method', context.method);

        var ctx = context.ctx;

        switch (context.method) {

          case 'publickey':

            if (
              ctx.key.algo === pubKey.fulltype &&
              buffersEqual(ctx.key.data, pubKey.public)
            ) {

              if (ctx.signature) {
                var verifier = crypto.createVerify(ctx.sigAlgo);
                verifier.update(ctx.blob);
                if (verifier.verify(pubKey.publicOrig, ctx.signature)) {
                  context.accept(function(session) {
                    sessionHandler(session);
                  });
                  return;
                } else {
                  console.log('Key not verified');
                }

              } else {
                console.log('No signature');
                context.accept();
                return;
              }

            } else {
              console.log('Keys do not match');
            }

            break;
        }

        context.reject(['publickey']);

      });

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
