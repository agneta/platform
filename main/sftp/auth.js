const ssh2 = require('ssh2');
const sessionHandler = require('./session');
const utils = ssh2.utils;
const crypto = require('crypto');
const buffersEqual = require('buffer-equal-constant-time');
const path = require('path');
const fs = require('fs-extra');

module.exports = function(server,app) {

  var pubKey = fs.readFileSync(
    path.join(process.cwd(), 'tmp', 'rsa_test.pub')
  );
  pubKey = utils.genPublicKey(utils.parseKey(pubKey));

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
                sessionHandler(session,app);
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
};
