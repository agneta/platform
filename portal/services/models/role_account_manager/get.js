/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/models/account/get.js
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

  var webServices = app.web.services;
  var rolesConfig = webServices.get('roles');

  Model.get = function(req, id) {

    var Account = Model.getModel('Account');
    var Account_Web = webServices.$model.get({
      name: 'Account',
      isProduction: Model.__isProduction
    });
    if (req.accessToken.roles.administrator) {

      return Account_Web.__get(id, {
        include: Account_Web.rolesInclude
      })
        .then(function(account) {

          account = account.__data;

          //console.log(account);

          var roles = _.pick(account, Account_Web.roleKeys);
          account = _.omit(account, Account_Web.roleKeys.concat(['password']));

          //console.log(roles);

          for (var roleKey in roles) {
            var role = roles[roleKey];
            var config = rolesConfig[roleKey];
            if (config.form) {
              role.editable = true;
            }
          }

          account.roles = roles;

          return account;
        });

    } else {

      console.log('Not an administrator');

      return Account.findById(id, {
        fields: {
          id: true,
          name: true,
          avatar: true,
          picture: true,
          username: true
        }
      });

    }



  };

  Model.remoteMethod(
    'get', {
      description: 'Get user\'s administrative settings',
      accepts: [{
        arg: 'req',
        type: 'object',
        'http': {
          source: 'req'
        }
      }, {
        arg: 'id',
        type: 'string',
        required: true
      }],
      returns: {
        arg: 'result',
        type: 'object',
        root: true
      },
      http: {
        verb: 'get',
        path: '/get'
      }
    }
  );

};
