const _ = require('lodash');

module.exports = function(app) {

  var config = app.get('certificate');
  var roles = app.get('roles');

  if (!config) {
    return;
  }

  for (var name of config.roles) {
    roles[name].auth = auth;
  }

  function auth(role, context) {


    var cert = context.remotingContext.req.socket.getPeerCertificate();
    var app = context.model.app;

    return Promise.resolve()
      .then(function() {

        return app.models.Account.findById(context.accessToken.userId, {
          fields: {
            email: true
          }
        });
      })
      .then(function(account) {

        var checkEmail = _.get(cert, config.map);

        if (!checkEmail) {
          return Promise.reject({
            statusCode: 400,
            message: 'Certificate does not contain email address'
          });
        }

        if (account.email != checkEmail) {
          return Promise.reject({
            statusCode: 400,
            message: `Certificate email (${checkEmail}) does not match with the account you have logged in. Log out and refresh the page.`
          });
        }

        return true;

      });


  }

};
