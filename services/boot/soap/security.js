/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/server/boot/soap/security.js
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
const Promise = require('bluebird');
var configSecrets;
module.exports = function(app) {

  var config = app.get('wsdl');

  if (!configSecrets) {
    configSecrets = app.secrets.get('wsdl');
  }
  var methods = {

    certificate: function(options, auth) {

      var req = options.methodOptions.req;
      var role;

      return app.models.Account.roleGet(auth.role, req)
        .then(function(_role) {
          role = _role;

          if (!role) {
            return Promise.reject({
              message: 'Account does not have the right role',
              statusCode: 401
            });
          }

          role = role.__data;
          //console.log(role);
          var pfx = role[auth.prop.pfx];

          if (!pfx) {
            return Promise.reject({
              message: 'Must have a certificate assigned to your role',
              statusCode: 401
            });
          }

          options.agentOptions = {
            pfx: pfx.data,
            passphrase: app.secrets.decrypt(role[auth.prop.pass])
          };

          //console.log('soap:security:options.agentOptions', options.agentOptions);

        });

    },
    basic: function(options, auth, secrets) {
      if (!secrets.username || !secrets.password) {
        throw new Error('Basic Authentication must have username and password');
      }
      return Promise.resolve()
        .then(function() {
          options.headers = options.headers || {};
          options.headers.Authorization = 'Basic ' + new Buffer((secrets.username + ':' + secrets.password) || '').toString('base64');
        });

    }
  };

  return function(options) {

    //console.log('soap:security:function:options',options);

    var authName = config.acl[options.servicePath];

    if (!authName) {
      return Promise.reject(
        new Error(`Could not find ACL for wsdl (${options.servicePath}) in config`)
      );
    }

    var auth = config.auth[authName];
    var secrets = configSecrets.auth[authName];
    var method = methods[auth.method];

    return Promise.resolve()
      .then(function() {

        if (!method) {
          console.warn(`Could not find method ${auth.method} for ${options.servicePath}`);
          return;
        }

        return method(options.requestOptions, auth, secrets);

      });

    //console.log('configSecurity', configSecurity);

  };

};
