const _ = require('lodash');
const Promise = require('bluebird');

module.exports = function(app) {

  return function(req, res, next) {

    var account = null;

    Promise
      .resolve()
      .then(function() {

        if (req.accessToken) {
          return;
        }

        //--------------------------------------
        // Auto sign-in user with certificate

        var cert = req.socket.getPeerCertificate();
        var certEmail = _.get(cert, 'subject.emailAddress');

        if (!cert) {
          return;
        }

        if (!certEmail) {
          return;
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

            if(req.accessToken && req.accessToken.userId == account.id){
              console.log(req.accessToken);
              console.log('already logged in');
              return;
            }

            if (!account) {
              var error = new Error('Your certificate does not correspond to a registered user. Choose another one, register your account, or remove it.');
              error.statusCode = 400;
              return Promise.reject(error);
            }

            return account.createAccessToken()
              .then(function(token) {

                //console.log('middleware:cretificate:token',token);

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
