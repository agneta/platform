/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/lib/secrets.js
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
const cryptojs = require('crypto-js');
const _ = require('lodash');
const fs = require('fs-extra');
const path = require('path');
const filename = 'secrets.json';

module.exports = function(app) {
  var encryptionKey;
  var keyPath = path.join(process.cwd(), '../secret.json');
  var secretKey = process.env.SECRET_KEY || fs.readJsonSync(keyPath, 'utf8');
  if (!secretKey) {
    throw new Error('Could not find the secret key to set sensitive data');
  }
  //---------------------------------------------

  var secretsPath = path.join(app.configstore.path, '..', filename);
  var keys = fs.readJsonSync(secretsPath);

  //----------------------------------------------------
  // Check if secret key is valid

  if (!keys.isValid) {
    throw new Error('Not a correct secret file');
  }

  var isValid = cryptojs.AES.decrypt(keys.isValid, secretKey);
  isValid = isValid.toString(cryptojs.enc.Utf8);

  //console.log(keys);
  //console.log('isValid', isValid);
  //console.log('secretKey', secretKey);

  if (isValid != 'yes') {
    throw new Error('The secret key is incorrect');
  }

  //----------------------------------------------------
  // Decrypt all the object values

  _.deepMapValues(keys, function(value, path) {
    if (!_.isString(value)) {
      return;
    }
    value = cryptojs.AES.decrypt(value, secretKey).toString(cryptojs.enc.Utf8);
    _.set(keys, path, value);
  });

  function getSecret(env, path) {
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

    return value;
  }

  var secrets = {
    get: function(path) {
      var env;
      if (_.isFunction(app.get)) {
        env = app.web.services.get('env');
      }
      env = env || process.env.NODE_ENV;
      var result = getSecret(env, path);
      if (path == 'db') {
        if (result.host == 'mongoDB' && process.env.MODE == 'terminal') {
          result.host = 'localhost';
        }
      }

      return result;
    },
    encrypt: function(value) {
      value = value.toString('utf8');
      return cryptojs.AES.encrypt(value, encryptionKey).toString();
    },
    decrypt: function(value) {
      return cryptojs.AES.decrypt(value, encryptionKey).toString(
        cryptojs.enc.Utf8
      );
    }
  };

  encryptionKey = encryptionKey || secrets.get('encryptionKey');
  if (!encryptionKey) {
    throw new Error(`The encryptionKey needs to be stored in ${filename}`);
  }

  if (app) {
    app.secrets = secrets;
  }

  return secrets;
};
