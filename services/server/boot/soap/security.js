const Promise = require('bluebird');

module.exports = function(app) {

  var config = app.get('wsdl');

  var methods = {

    certificate: function(options, auth) {

      var req = options.methodOptions.req;
      var role;

      return app.models.Account.roleGet(auth.role, req)
        .then(function(_role) {
          role = _role;

          if (!role) {
            return Promise.reject({
              message: 'Account does not have the right role',
              statusCode: 401
            });
          }

          role = role.__data;
          //console.log(role);
          var pfx = role[auth.prop.pfx];

          if(!pfx){
            return Promise.reject({
              message: 'Must have a certificate assigned to your role',
              statusCode: 401
            });
          }

          options.agentOptions = {
            pfx: pfx.data,
            passphrase: app.secrets.decrypt(role[auth.prop.pass])
          };

          //console.log('soap:security:options.agentOptions', options.agentOptions);

        });

    },
    basic: function(options, auth) {

      options.headers = options.headers || {};
      options.headers.Authorization = 'Basic ' + new Buffer((auth.username + ':' + auth.password) || '').toString('base64');

    }
  };

  return function(options) {

    //console.log('soap:security:function:options',options);

    var authName = config.acl[options.servicePath];

    if (!authName) {
      return;
    }

    var auth = config.auth[authName];
    var method = methods[auth.method];

    return Promise.resolve()
      .then(function() {

        if (!method) {
          console.warn(`Could not find method ${auth.method} for ${options.servicePath}`);
          return;
        }

        return method(options.requestOptions, auth);

      });

    //console.log('configSecurity', configSecurity);

  };

};
