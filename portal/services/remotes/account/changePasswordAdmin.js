/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/remotes/account/changePasswordAdmin.js
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


  Model.changePasswordAdmin = function(password, accountId, req) {

    var account;
    var AccessToken = app.models.AccessToken;

    return Model.findById(accountId)
      .then(function(_account) {

        account = _account;

        if (!account) {
          var err = new Error('Account not found');
          err.statusCode = 400;
          throw err;
        }

        return AccessToken.destroyAll({
          userId: account.id
        });
      })
      .then(function() {

        return account.updateAttributes({
          password: password
        });

      })
      .then(function() {

        Model.sendVerification({
          account: account,
          req: req,
          template: 'password-change',
          subject: app.lng('account.passwordChangedSubject',req)
        });

        Model.activity({
          req: req,
          action: 'password_change_admin',
          data: {
            accountId: account.id
          }
        });

        return {
          success: app.lng('admin.passwordChanged',req)
        };

      });

  };

  Model.remoteMethod(
    'changePasswordAdmin', {
      description: 'Change password for a user with email.',
      accepts: [{
        arg: 'password',
        type: 'string',
        required: true
      }, {
        arg: 'accountId',
        type: 'string',
        required: true
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
        path: '/change-password-admin'
      },
    }
  );


};
