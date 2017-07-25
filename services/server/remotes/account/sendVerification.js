/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/server/remotes/account/sendVerification.js
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
const utils = require('loopback/lib/utils');
const assert = require('assert');
const urljoin = require('urljoin');

module.exports = function(Model, app) {

  var email = app.get('email');

  Model.sendVerification = function(options) {
    var language = app.getLng(options.req);
    var urlPath = options.path || 'login';
    var verifyHref = urljoin(app.get('website').url, language, urlPath,
      '?action=verify' +
            '&uid=' + options.account.id
    );

    return options.account.verify({
      type: 'email',
      to: options.account.email,
      from: email.contacts.support,
      subject: options.subject || 'Thanks for registering.',
      language: language,
      req: options.req,
      templateName: options.template || 'verify',
      user: options.account,
      verifyHref: verifyHref
    });

  };

  Model._sendVerification = function(context, result) {

    return Model.sendVerification({
      account: result.account,
      req: context.req
    })
      .then(function() {
        return {
          success: result.success
        };
      });

  };

  Model.prototype.verify = function(options, fn) {
    fn = fn || utils.createPromiseCallback();

    var user = this;
    var userModel = this.constructor;
    var registry = userModel.registry;
    assert(typeof options === 'object', 'options required when calling user.verify()');
    assert(options.verifyHref, 'You must supply a verification href');
    assert(options.type, 'You must supply a verification type (options.type)');
    assert(options.type === 'email', 'Unsupported verification type');
    assert(options.to || this.email, 'Must include options.to when calling user.verify() or the user must have an email property');
    assert(options.from, 'Must include options.from when calling user.verify()');

    // Email model
    var Email = options.mailer || this.constructor.email || registry.getModelByType(loopback.Email);

    // Set a default token generation function if one is not provided
    var tokenGenerator = options.generateVerificationToken || Model.generateVerificationToken;

    tokenGenerator(user,null, function(err, token) {
      if (err) {
        return fn(err);
      }

      user.verificationToken = token;
      user.save(function(err) {
        if (err) {
          fn(err);
        } else {
          sendEmail(user);
        }
      });
    });

    // TODO - support more verification types
    function sendEmail(user) {
      options.verifyHref += '&token=' + user.verificationToken;

      var language = options.language;
      if(!language && options.req){
        language = app.getLng(options.req);
      }
      
      options.data = {
        verifyHref: options.verifyHref,
        language: language
      };

      options.to = options.to || user.email;
      options.subject = options.subject;
      options.headers = options.headers || {};

      Email.send(options, function(err, email) {
        if (err) {
          fn(err);
        } else {
          fn(null, {
            email: email,
            token: user.verificationToken,
            uid: user.id
          });
        }
      });
    }
    return fn.promise;
  };

};
