/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/middleware/certificate.js
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
const _ = require('lodash');
const Promise = require('bluebird');

module.exports = function(app) {

  var config = app.get('certificate');

  return function(req, res, next) {

    var account = null;

    Promise
      .resolve()
      .then(function() {

        //--------------------------------------
        // Auto sign-in user with certificate

        var cert = req.socket.getPeerCertificate();
        var certEmail = _.get(cert, config.map);

        if (!cert || !cert.subject){
          return;
        }

        if (!certEmail) {
          console.log('cert.subject',cert.subject);
          return Promise.reject({
            statusCode: 400,
            message: 'Could not find field on certificate to map with'
          });
        }

        return app.models.Account.findOne({
          include: app.roles.include,
          where: {
            email: certEmail
          },
          fields: {
            id: true
          }
        })
          .then(function(_account) {

            account = _account;

            if (!account) {
              var error = new Error(`Your certificate email ${certEmail} does not correspond to a registered user. Choose another one, register your account, or remove it.`);
              error.statusCode = 400;
              return Promise.reject(error);
            }

            //-------------------------------------------------------------------

            //console.log('certificate:account',account);
            //console.log('certificate:accessToken',req.accessToken);

            var TokenuserId = _.get(req, 'accessToken.userId');
            if (
              TokenuserId &&
              (TokenuserId.toString() == account.__data.id.toString())) {

              //console.log('already logged in');
              return;

            }

            //-------------------------------------------------------------------

            return account.createAccessToken()
              .then(function(token) {

                //console.log('middleware:cretificate:token',token);

                app.models.Account.__setLoginCookie({
                  token: token,
                  req: req,
                  res: res
                });

                app.token.save({
                  account: account,
                  token: token,
                  req: req
                });

              });
          });

      })
      .asCallback(next);


  };

};
