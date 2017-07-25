/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/server/remotes/account/requestRecovery.js
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

module.exports = function(Model,app) {

  Model.requestRecovery = function(email, req) {

    var account;

    return Model.findOne({
      where: {
        email: email
      }
    })
      .then(function(_account) {

        account = _account;

        if (!account) {

          var err1 = new Error('Email not recognized');
          err1.statusCode = 400;
          err1.code = 'ACC_NOT_FOUND';

          throw err1;
        }

        if (!account.deactivated) {

          var err2 = new Error('Account is already active');
          err2.statusCode = 400;
          err2.code = 'ACC_ALREADY_ACTIVE';

          throw err2;

        }

        var options = {
          email: email
        };

        return Model.resetPassword(options);

      })
      .then(function() {

        Model.activity({
          req: req,
          accountId: account.id,
          action: 'recovery_request'
        });

        return {
          success: app.lng('account.recoveryRequested',req)
        };
      });

  };

  Model.remoteMethod(
    'requestRecovery', {
      description: 'Deactivate an account',
      accepts: [{
        arg: 'email',
        type: 'string',
        required: true,
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
        path: '/request-recovery'
      }
    }
  );

};
