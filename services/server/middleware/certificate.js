const _ = require('lodash');

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
              return Promise.reject({
                statusCode: 400,
                message: 'Your certificate does not correspond to a registered user. Choose another one, register your account, or remove it.'
              });
            }

            return account.createAccessToken();
          })
          .then(function(token) {

            app.token.save({
              account: account,
              token: token,
              req: req
            });

          });

      })
      .asCallback(next);


  };

};
