const _ = require('lodash');

module.exports = function(app) {

  var config = app.get('certificate');
  var roles = app.get('roles');

  if(!config){
    return;
  }

  for(var roleEnable of config.roles){
    roles[roleEnable].auth = auth;
  }

  function auth(role, context) {

    var cert = context.remotingContext.req.socket.getPeerCertificate();
    var app = context.model.app;

    return Promise.resolve()
      .then(function() {

        return app.models.Account.findById(context.accessToken.userId,{
          fields: {
            email: true
          }
        });
      })
      .then(function(account) {

        var checkEmail = _.get(cert,'subject.emailAddress');

        if(!checkEmail){
          return Promise.reject({
            statusCode: 400,
            message: 'Certificate does not contain email address'
          });
        }

        if(account.email != checkEmail){
          return Promise.reject({
            statusCode: 400,
            message: 'Certificate does not match with the account you have logged in. Log out and refresh the page.'
          });
        }

        return true;
      });

  }

};
