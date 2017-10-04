const cryptojs = require('crypto-js');
const _ = require('lodash');
const fs = require('fs-extra');
const path = require('path');

module.exports = function(app, options) {

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

  var keys = _.extend({},
    require(
      path.join(options.client.project.paths.project, 'secrets.json')
    ));

  //----------------------------------------------------
  // Check if secret key is valid

  var isValid = keys.isValid;

  if (!isValid) {
    throw new Error('Not a correct secret file');
  }

  isValid = cryptojs.AES.decrypt(
    isValid.toString(), secretKey).toString(cryptojs.enc.Utf8);

  //console.log(keys);
  //console.log('isValid', isValid);
  //console.log('secretKey', secretKey);

  if (isValid != 'yes') {
    throw new Error('The secret key is incorrect');
  }

  //----------------------------------------------------
  // Decrypt all the object values

  _.deepMapValues(keys, function(value, path) {
    value = cryptojs.AES.decrypt(value.toString(), secretKey)
      .toString(cryptojs.enc.Utf8);
    _.set(keys, path, value);
  });

  //----------------------------------------------------

  function getSecret(env, path, keep) {

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
    if (!keep) {
      _.unset(obj, path);
    }
    return value;

  }


  app.secrets = {
    get: function(path,keep) {

      var env = app.get('env');
      return getSecret(env, path, keep);

    }
  };
};
