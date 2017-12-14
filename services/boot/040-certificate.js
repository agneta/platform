/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/boot/040-certificate.js
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

module.exports = function(app) {

  var config = app.get('certificate');
  var roles = app.get('roles');

  if (!config) {
    return;
  }

  for (var name of config.roles) {
    roles[name].auth = auth;
  }

  function auth(role, context) {


    var cert = context.remotingContext.req.socket.getPeerCertificate();
    var app = context.model.app;

    return Promise.resolve()
      .then(function() {

        return app.models.Account.findById(context.accessToken.userId, {
          fields: {
            email: true
          }
        });
      })
      .then(function(account) {

        var checkEmail = _.get(cert, config.map);

        if (!checkEmail) {
          return Promise.reject({
            statusCode: 400,
            message: 'Certificate does not contain email address'
          });
        }

        if (account.email != checkEmail) {
          return Promise.reject({
            statusCode: 400,
            message: `Certificate email (${checkEmail}) does not match with the account you have logged in. Log out and refresh the page.`
          });
        }

        return true;

      });


  }

};
