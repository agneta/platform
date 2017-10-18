/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/remotes/account/roleEdit.js
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

  var rolesConfig = app.get('roles');

  Model.roleEdit = function(accountId, roleName, data) {

    var roleConfig = rolesConfig[roleName];
    if (!roleConfig.form) {
      return Promise.reject('No form for role is available');
    }

    var fieldNames = [];

    for (var field of roleConfig.form.fields) {
      if (field.name) {
        fieldNames.push(field.name);
      }
    }

    return Model.roleGetAdmin(accountId, roleName)
      .then(function(role) {
        console.log(fieldNames, data);
        data = _.pick(
          data,
          fieldNames
        );

        if (!_.keys(data).length) {
          return Promise.reject('Nothing to update');
        }

        return role.updateAttributes(data);

      })
      .then(function() {
        return {
          success: 'The role is updated!'
        };
      });

  };

  Model.remoteMethod(
    'roleEdit', {
      description: '',
      accepts: [{
        arg: 'accountId',
        type: 'string',
        required: true
      }, {
        arg: 'roleName',
        type: 'string',
        required: true
      }, {
        arg: 'data',
        type: 'object',
        required: true
      }],
      returns: {
        arg: 'result',
        type: 'object',
        root: true
      },
      http: {
        verb: 'post',
        path: '/role-edit'
      }
    }
  );

};
