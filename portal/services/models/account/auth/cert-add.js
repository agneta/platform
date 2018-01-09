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
