/*   Copyright 2017 Agneta Network Applications, LLC.
*
*   Source file: services/models/account/register.js
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

var zxcvbn = require('zxcvbn');

module.exports = function(Model, app) {

  var callbacks = app.get('account').callbacks;

  Model.__register = function(options) {

    var email = options.email;
    var username = options.username;
    var password = options.password;
    var req = options.req;
    var path = options.path;

    if (path) {
      path = callbacks.indexOf(path) >= 0 ? path : null;
    }

    if (!email && !username) {

      return Promise.reject({
        statusCode: 400,
        message: app.lng('account.noIdentity', req)
      });

    }
    var or = [];
    if (email) {
      or.push({
        email: email
      });
    }
    if (username) {
      or.push({
        username: username
      });
    }

    return Model.findOne({
      where: {
        or: or
      },
      fields: {
        id: true
      }
    })
      .then(function(result) {

        if (result) {
          return Promise.reject({
            code: 'EXISTS',
            statusCode: 400,
            message: app.lng('account.exists', req)
          });
        }

      })
      .then(function() {

        return Model.create({
          email: email,
          password: password
        });

      })
      .then(function(account) {
        Model.sendVerification({
          account: account,
          path: 'partner/dashboard',
          req: req
        });
        return account;
      });

  };

  Model.register = function(email, username, password, recaptcha, req) {

    return Model.__register({
      email: email,
      username: username,
      password: password,
      req: req
    })
      .then(function(account) {
        return {
          account: account,
          success: {
            title: 'Thank you for registering',
            content: 'We sent an email for you to verify your account'
          }
        };
      });

  };

  Model.remoteMethod(
    'register', {
      description: 'Register user with email and password.',
      accepts: [{
        arg: 'email',
        type: 'string',
        required: false,
      }, {
        arg: 'username',
        type: 'string',
        required: false,
      }, {
        arg: 'password',
        type: 'string',
        required: true
      }, {
        arg: 'recaptcha',
        type: 'string',
        required: true
      }],
      returns: {
        arg: 'result',
        type: 'object',
        root: true
      },
      http: {
        verb: 'post',
        path: '/register'
      }
    }
  );

  Model.beforeRemote('register', function(context) {

    return Promise.resolve()
      .then(function() {

        var strength = zxcvbn(context.req.body.password);
        if (strength.score <= 2){
          return Promise.reject({
            statusCode: 400,
            message: 'Password does not meet strength requirements',
            feedback: strength.feedback
          });
        }

      })
      .then(function() {
        return app.recaptcha.verify(context.req.recaptcha);
      })
      .then(function(response) {

        if (!response.success) {
          return Promise.reject({
            code: 'RECAPTCHA_ERROR',
            statusCode: 400,
            message: 'The recaptcha you sent is invalid'
          });
        }

      });

  });


};
