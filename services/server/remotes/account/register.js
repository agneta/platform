/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/server/remotes/account/register.js
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
const path = require('path');
const eRecaptcha = require('express-recaptcha');
const loopback = require('loopback');
const utils = require('loopback/lib/utils');
const _ = require('lodash');
const assert = require('assert');
const urljoin = require('urljoin');

module.exports = function(Model, app) {

  Model.register = function(email, password, recaptcha) {

    return Model.create({
      email: email,
      password: password
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
        required: true,
      }, {
        arg: 'password',
        type: 'string',
        required: true
      }, {
        arg: 'recaptcha',
        type: 'string',
        required: false
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

  if (false) { // Fix this
    Model.beforeRemote('register', function(context, account, next) {

      var recaptcha = context.req.recaptcha;

      eRecaptcha.verify(recaptcha, function(error) {

        if (error) {
          return next({
            code: 'RECAPTCHA_ERROR',
            message: 'The recaptcha you sent is invalid',
            data: error
          });
        }

        next();
      });

    });
  }

  Model.afterRemote('register', Model._sendVerification);

};
