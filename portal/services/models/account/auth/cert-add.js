/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/models/account/auth/cert-add.js
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

module.exports = function(Model, app) {

  Model.certCheck = function(req){

    var params = req.body;

    return Promise.resolve()
      .then(function(){

        if(!params.accountId){
          return Promise.reject({
            statusCode: 400,
            message: 'Account ID is required'
          });
        }

      });

  };

  Model.certAdd = function(req) {

    var params = req.body;

    return Model.certCheck(req)
      .then(function() {

        return Model.__get(params.accountId);

      })
      .then(function(account) {

        return account.cert.create({
          title: params.title,
          fingerprint: params.fingerprint,
          createdAt: new Date()
        });

      })
      .then(function(cert) {
        return Model.certPfx(cert, req);
      })
      .then(function() {
        return {
          message: 'You have create the certificate'
        };
      });

  };

  app.attachment.generateMethod({
    model: Model,
    name: 'certAdd',
    path: '/cert-add',
    single: 'pfxFile'
  });

};
