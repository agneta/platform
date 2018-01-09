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
