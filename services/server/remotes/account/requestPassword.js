/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/server/remotes/account/requestPassword.js
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

const urljoin = require('url-join');

module.exports = function(Model, app) {

  var callbacks = app.get('account').callbacks;

  Model.requestPassword = function(email, callback, req) {

    if (callback) {
      callback = callbacks.indexOf(callback) >= 0 ? callback : null;
    }

    var options = {
      email: email,
      req: req,
      path: callback
    };

    var account;

    return Model.findOne({
      where: {
        email: email
      }
    })
      .then(function(_account) {

        account = _account;
        return Model.resetPassword(options);

      })
      .then(function() {

        Model.activity({
          req: req,
          accountId: account.id,
          action: 'password_request'
        });

        return {
          success: app.lng('account.requestPassword', req)
        };
      });

  };


  Model.remoteMethod(
    'requestPassword', {
      description: 'Reset password for a user with email.',
      accepts: [{
        arg: 'email',
        type: 'string',
        required: true
      }, {
        arg: 'callback',
        type: 'string',
        required: false
      }, {
        arg: 'req',
        type: 'object',
        'http': {
          source: 'req'
        }
      }],
      returns: {
        arg: 'result',
        type: 'object',
        root: true
      },
      http: {
        verb: 'post',
        path: '/request-password'
      },
    }
  );

  Model.on('resetPasswordRequest', function(info) {

    var templateName;
    var action;
    var subject;
    var req = info.options.req;
    var language = app.getLng(req);

    if (info.user.deactivated) {
      subject = 'Recovering your account.';
      action = 'recover-account';
      templateName = 'recover-account';
    } else {
      subject = 'Resetting your password.';
      action = 'password-reset';
      templateName = 'password-reset';
    }

    var url = urljoin(app.get('website').url,
      language,
      info.options.path || 'login',
      '?action=' + action +
      '&token=' + info.accessToken.id);

    app.loopback.Email.send({
      to: info.email,
      subject: subject,
      templateName: templateName,
      data: {
        actionHref: url
      },
      user: info.user,
      req: req
    });

  });

};
