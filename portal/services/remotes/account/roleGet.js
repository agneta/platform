/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/remotes/account/roleGet.js
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

  Model.roleGet = function(accountId, roleName) {

    return Model.findById(accountId)
      .then(function(account) {

        if (!account) {
          throw new Error('Account not found');
        }

        var role = Model.roleOptions[roleName];

        if (!role) {
          throw new Error('No role found: ' + roleName);
        }

        var RoleModel = app.models[role.model];

        return RoleModel.findOne({
          where: {
            accountId: account.id
          }
        });

      });

  };

  Model.remoteMethod(
    'roleGet', {
      description: '',
      accepts: [{
        arg: 'accountId',
        type: 'string',
        required: true
      }, {
        arg: 'roleName',
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
        path: '/role-get'
      }
    }
  );

};
