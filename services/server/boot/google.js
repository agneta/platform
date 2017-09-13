/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/server/boot/recaptcha.js
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
const request = require('request-promise');
var config;

module.exports = function(app) {

  if (!config) {
    config = app.secrets.get('google');
  }

  //---------------------------------------------------
  //

  app.set('google', {
    api: config.apiKey,
    recaptcha: config.recaptcha.siteKey
  });

  //---------------------------------------------------
  // Recaptcha



  if (!config.recaptcha) {
    console.warn('Could not find Recaptcha configuration');
    return;
  }

  app.recaptcha = {
    verify: function(response) {

      var verificationUrl = 'https://www.google.com/recaptcha/api/siteverify?secret=' + config.recaptcha.secretKey + '&response=' + response;

      return request({
        uri: verificationUrl,
        json: true
      });

    }
  };

};
