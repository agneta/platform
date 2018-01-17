/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/models/account/auth/cert-update.js
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
const fs = require('fs-extra');
const Promise = require('bluebird');

module.exports = function(Model, app) {

  Model.certUpdate = function(req) {

    var params = req.body;

    return Model.certCheck(req)
      .then(function() {

        if(!params.id){
          return Promise.reject({
            statusCode: 400,
            message: 'Certificate ID is required'
          });
        }

        return Model.getModel('Account_Cert').findById(params.id);

      })
      .then(function(cert) {

        if(!cert){
          return Promise.reject({
            statusCode: 400,
            message: 'Certificate not found'
          });
        }

        return cert.patchAttributes({
          title: params.title,
          fingerprint: params.fingerprint
        });
      })
      .then(function(cert) {
        return Model.certPfx(cert, req);
      })
      .then(function() {
        return {
          message: 'You have updated the certificate'
        };
      });

  };

  app.attachment.generateMethod({
    model: Model,
    name: 'certUpdate',
    path: '/cert-update',
    single: 'pfxFile'
  });

  Model.certPfx = function(cert, req) {

    var params = req.body;

    return Promise.resolve()
      .then(function() {
        if (!req.file) {
          return;
        }

        return fs.readFile(req.file.path)
          .then(function(content) {

            if (!params.passphrase) {
              return Promise.reject({
                statusCode: 400,
                message: 'Passphrase is required for the PFX'
              });
            }

            return app.pfx.validate({
              pfx: content,
              passphrase: params.passphrase
            });

          })
          .then(function() {

            return cert.uploadPfx(req);

          })
          .then(function() {
            return cert.patchAttributes({
              pfxPass: app.secrets.encrypt(params.passphrase)
            });
          });
      });


  };
};
