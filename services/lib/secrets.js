const cryptojs = require('crypto-js');
const _ = require('lodash');
const fs = require('fs-extra');
const path = require('path');

module.exports = function(app) {

  var secretKey = process.env.AGNETA_SECRET_KEY;

  if (!secretKey) {

    var dirSecrets = path.join(process.cwd(), '..', 'secrets');

    if (
      fs.existsSync(dirSecrets)
    ) {
      secretKey = require(path.join(
        dirSecrets, 'key.json'
      ));
    }
  }

  if (!secretKey) {
    throw new Error('Could not find the secret key to set sensitive data');
  }

  delete process.env.AGNETA_SECRET_KEY;

  var keys = require(
    path.join(process.cwd(), 'secrets.json')
  );

  _.deepMapValues(keys, function(value, path) {
    value = cryptojs.AES.decrypt(value, secretKey).toString();
    _.set(keys, path, value);
  });

  var env = app.get('env');

  app.secrets = {
    get: function(path) {

      var value = null;
      var obj = null;

      if (keys[env]) {
        obj = keys[env];
        value = _.get(obj, path);
      }
      if (!value) {
        obj = keys.default;
        value = _.get(obj, path);
      }

      _.unset(obj, path);
      return value;

    }
  };
};
