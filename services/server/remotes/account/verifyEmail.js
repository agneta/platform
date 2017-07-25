/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/server/remotes/account/verifyEmail.js
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

  Model.verifyEmail = function(uid, token, req) {

    return Model.confirm(uid, token, null)
      .then(function() {

        Model.activity({
          req: req,
          accountId: uid,
          action: 'verify'
        });

        return {
          success: app.lng('account.verified',req)
        };

      });

  };


  Model.remoteMethod(
    'verifyEmail', {
      description: 'Confirm a account registration with uid verification token.',
      accepts: [{
        arg: 'uid',
        type: 'string',
        required: true
      }, {
        arg: 'token',
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
        path: '/verify'
      },
    }
  );

};
