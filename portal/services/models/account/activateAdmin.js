/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/remotes/account/activateAdmin.js
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
module.exports = function(Model) {


  Model.activateAdmin = function(id, req) {

    return Model.__signOutAll(id)
      .then(function() {
        return Model.__get(id);
      })
      .then(function(account) {
        return account.updateAttributes({
          deactivated: false
        });
      })
      .then(function() {

        Model.activity({
          req: req,
          action: 'activate_account_admin'
        });

        return {
          success: {
            title: 'Account Activated',
            content: 'The account can login again.'
          }
        };

      });

  };

  Model.remoteMethod(
    'activateAdmin', {
      description: 'Activate Account with given ID',
      accepts: [{
        arg: 'id',
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
        path: '/activate-admin'
      }
    }
  );


};
