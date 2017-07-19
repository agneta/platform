/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/remotes/role_administrator.js
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
var _ = require('lodash');

module.exports = function(Model, app) {

  var Account = app.models.Account;
  app.helpers.mixin('disableAllMethods', Model);

  Model.validatesUniquenessOf('accountId', {
    message: 'Account is already an administrator'
  });

  ////////////////////////////////////////////////////////

  Model.me = function(req) {

    return Model.findOne({
      where: {
        accountId: req.accessToken.userId
      }
    });

  };

  Model.remoteMethod(
    'me', {
      description: 'Get user\'s administrative settings',
      accepts: [{
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
        path: '/me'
      },
    }
  );

  ////////////////////////////////////////

  Model.new = function(options) {

    if (!options.email) {
      throw new Error('Must provide an email for administrator creation');
    }

    return Account.findOne({
      where: {
        email: options.email
      }
    })
      .then(function(account) {

        if (!account) {
          return Account.create({
            email: options.email,
            password: options.password || 'password',
            emailVerified: true,
            language: 'en'
          });
        }

        return account;

      })
      .then(function(account) {

        return Model.findOrCreate({
          where: {
            accountId: account.id
          }
        }, {
          accountId: account.id
        });
      });

  };
};
