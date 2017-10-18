const Promise = require('bluebird');

module.exports = function(app) {

  return function(options) {

    var config = options.config;
    var requestOptions = options.requestOptions;

    var configSecurity = config.security || {};

    console.log('configSecurity', configSecurity);

    return Promise.resolve()
      .then(function() {

        if (!configSecurity.roleCertificate) {
          return;
        }

        var req = requestOptions.methodOptions.req;
        var role;

        return app.models.Account.roleGet(configSecurity.roleCertificate,req)
          .then(function(_role) {
            role = _role;

            if(!role){
              throw new Error('Account does not have the right role');
            }

            role = role.__data;
            console.log(role);


            requestOptions.agentOptions = {
              pfx: role.pfxFile.data,
              passphrase: app.secrets.decrypt(role.pfxPass)
            };

            console.log(requestOptions.agentOptions);

          });

      });

  };
};
