/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/boot/roles.js
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

const _ = require('lodash');
const Promise = require('bluebird');

module.exports = function(app) {

  var roles = app.get('roles');

  function set(Account, roles) {

    var Role = app.models.Role;
    //console.log(roles);
    for (var name in roles) {
      var role = roles[name];
      var model = app.models[role.model];
      model.belongsTo(Account, {
        foreignKey: 'accountId',
        as: 'account'
      });

      model.validatesUniquenessOf('accountId');

      Account.hasOne(model, {
        foreignKey: 'accountId',
        as: name
      });

      Role.registerResolver(name, function(roleName, context, cb) {

        var role = roles[roleName];

        Promise.resolve()
          .then(function() {

            var result = context.accessToken && context.accessToken.roles && context.accessToken.roles[roleName];

            if (result && role.auth) {
              return role.auth(role, context);
            }

            return result?true:false;

          })
          .asCallback(cb);

      });

    }

  }

  //-----------------------------------

  var roleKeys = _.keys(roles);
  var include = _.map(roleKeys, function(name) {
    return {
      relation: name,
      scope: {
        fields: ['id']
      }
    };
  });

  //-----------------------------------

  set(app.models.Account, roles);

  app.roles = {
    set: set,
    include: include
  };
};
