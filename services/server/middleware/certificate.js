const _ = require('lodash');
const Promise = require('bluebird');

module.exports = function(app) {

  return function(req, res, next) {

    var account = null;

    Promise
      .resolve()
      .then(function() {

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

            if (!account) {
              var error = new Error('Your certificate does not correspond to a registered user. Choose another one, register your account, or remove it.');
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
