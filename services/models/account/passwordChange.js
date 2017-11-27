/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/server/remotes/account/passwordChange.js
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
module.exports = function(Model, app) {

  Model.passwordChange = function(password_old, password_new, req) {

    return Model.signOutAll(req)
      .then(function() {
        return Model.findById(req.accessToken.userId);
      })
      .then(function(account) {
        return account.updateAttributes({
          password: password_new
        });
      })
      .then(function(account) {

        Model.activity({
          req: req,
          action: 'password_change'
        });

        return {
          success: app.lng('account.passwordChanged',req),
          email: account.email
        };

      });

  };


  Model.remoteMethod(
    'passwordChange', {
      description: 'Change password for a user with email.',
      accepts: [{
        arg: 'password_old',
        type: 'string',
        required: false
      }, {
        arg: 'password_new',
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
        path: '/password-change'
      },
    }
  );

  Model.beforeRemote('passwordChange', app.helpers.resubmitPassword);


};
