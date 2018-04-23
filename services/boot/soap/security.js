/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/boot/soap/security.js
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

  var config = app.web.services.get('wsdl');

  if (!configSecrets) {
    configSecrets = app.secrets.get('wsdl');
  }
  var methods = {

    certificate: function(options, auth) {

      var req = options.methodOptions.req;

      return req.accessToken.account.cert.findOne({
        where:{
          title: auth.prop.title
        },
        include: 'pfxFile'
      })
        .then(function(cert) {

          if (!cert) {
            return Promise.reject({
              message: `Account does not have the certificate with title: ${auth.prop.title}`,
              statusCode: 401
            });
          }
          cert = cert.__data;

          if (!cert.pfxFile || !cert.pfxFile.data || !cert.pfxPass) {
            return Promise.reject({
              message: 'Must have a pfx assigned to the client certificate',
              statusCode: 401
            });
          }

          var agentOptions = {
            pfx: cert.pfxFile.data,
            passphrase: app.secrets.decrypt(cert.pfxPass)
          };

          options.agentOptions = agentOptions;

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
          options.headers.Authorization = 'Basic ' + Buffer.from((secrets.username + ':' + secrets.password) || '').toString('base64');
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
