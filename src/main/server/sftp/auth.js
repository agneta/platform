/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: main/server/sftp/auth.js
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
const ssh2 = require('ssh2');
const sessionHandler = require('./session');
const utils = ssh2.utils;
const crypto = require('crypto');
const buffersEqual = require('buffer-equal-constant-time');
const _ = require('lodash');

module.exports = function(server, app) {

  var config = app.get('sftp');

  server.on('connect', function(context) {

    //console.log('sftp:auth:context', context);
    //console.log('method', context.method);

    var ctx = context.ctx;

    switch (context.method) {

      case 'publickey':

        return app.models.Account.findOne({
          fields: {
            id: true,
            _ssh: true
          },
          where: {
            email: context.username
          }
        })
          .then(function(account) {

            if (!account) {
              return Promise.reject('Account not found');
            }
            var key = _.find(account._ssh,{title:'sftp'});
            //console.log(key);

            if (!key) {
              return Promise.reject('Key not found for user');
            }

            var pubKey = utils.genPublicKey(
              utils.parseKey(key.content)
            );

            if (
              ctx.key.algo === pubKey.fulltype &&
              buffersEqual(ctx.key.data, pubKey.public)
            ) {

              if (ctx.signature) {
                var verifier = crypto.createVerify(ctx.sigAlgo);
                verifier.update(ctx.blob);

                if (verifier.verify(pubKey.publicOrig, ctx.signature)) {

                  var acl = _.find(config.acl,{email:context.username});

                  if(!acl || !acl.allow){
                    return Promise.reject('User not allowed');
                  }

                  context.accept(function(session) {
                    session.acl = acl;
                    sessionHandler(session, app);
                  });
                  return;
                } else {
                  return Promise.reject('Key not verified');
                }

              } else {
                //console.log('No signature');
                return context.accept();
              }

            } else {
              // console.log('Keys do not match');
              return context.reject(['publickey']);
            }

          })
          .catch(function(err) {
            console.log(err);
            context.reject([err]);
          });
    }

    context.reject(['publickey']);

  });
};
