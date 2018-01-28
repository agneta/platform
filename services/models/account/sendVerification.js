/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/models/account/sendVerification.js
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
const loopback = require('loopback');
const assert = require('assert');
const urljoin = require('urljoin');
const Promise = require('bluebird');

module.exports = function(Model, app) {

  Model.sendVerification = function(options) {
    var language = app.getLng(options.req);
    var urlPath = options.path;
    var verifyHref = urljoin(app.get('website').url, language, urlPath);

    // With trailing slash: Fixes an issue where AWS redirects the location without the query string
    verifyHref += '/?action=verify' +
      '&uid=' + options.account.id;

    return options.account.verify({
      type: 'email',
      to: options.account.email,
      subject: options.subject || app.lng('account.registeredSubject', options.req),
      language: language,
      req: options.req,
      templateName: options.template || 'verify',
      user: options.account,
      verifyHref: verifyHref
    })
      .then(function() {
        return options.account.updateAttribute('veriSentAt', new Date());
      });

  };

  Model.prototype.verify = function(options) {

    var user = this;
    var userModel = this.constructor;
    var registry = userModel.registry;
    var Email = options.mailer || this.constructor.email || registry.getModelByType(loopback.Email);

    return Promise.resolve()
      .then(function() {

        assert(typeof options === 'object', 'options required when calling user.verify()');
        assert(options.verifyHref, 'You must supply a verification href');
        assert(options.type, 'You must supply a verification type (options.type)');
        assert(options.type === 'email', 'Unsupported verification type');
        assert(options.to || this.email, 'Must include options.to when calling user.verify() or the user must have an email property');

        var tokenGenerator = options.generateVerificationToken || Model.generateVerificationToken;

        return new Promise(function(resolve,reject) {
          tokenGenerator(user, null, function(err,token){
            if(err){
              return reject(err);
            }
            resolve(token);
          });
        });


      })
      .then(function(token) {

        user.verificationToken = token;
        return user.save();
      })
      .then(function(user) {

        options.verifyHref += '&token=' + user.verificationToken;

        var language = options.language;
        if (!language && options.req) {
          language = app.getLng(options.req);
        }

        options.data = {
          verifyHref: options.verifyHref,
          language: language
        };

        options.to = options.to || user.email;
        options.subject = options.subject;
        options.headers = options.headers || {};

        Email.send(options);
      });

  };

};
