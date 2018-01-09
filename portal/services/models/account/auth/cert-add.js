const fs = require('fs-extra');

module.exports = function(Model, app) {

  Model.certAdd = function(req) {

    var params = req.body;

    if(!params.accountId){
      return Promise.reject({
        statusCode: 400,
        message: 'Account ID is required'
      });
    }

    if(!params.passphrase){
      return Promise.reject({
        statusCode: 400,
        message: 'Passphrase is required'
      });
    }

    return fs.readFile(req.file.path)
      .then(function(content){

        var isPfxValid = app.pfx.validate({
          pfx: content,
          passphrase: params.passphrase
        });

        if(!isPfxValid){
          return Promise.reject({
            statusCode: 400,
            message: 'Passphrase is not correct'
          });
        }

        return Model.getModel('Account').__get(params.accountId);

      })
      .then(function(account) {

        return account.cert.create({
          title: params.title,
          pfxPass: app.secrets.encrypt(params.passphrase),
          fingerprint: params.fingerprint,
          createdAt: new Date()
        });

      })
      .then(function(cert) {
        return cert.uploadPfx(req);
      })
      .then(function(){
        return {
          message: 'You have updated the PFX file'
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
