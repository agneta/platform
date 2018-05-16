/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/models/account/me.js
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

module.exports = function(Model, app) {

  var webServices = app.web.services;
  var rolesConfig = webServices.get('roles');

  Model.me = function(req) {

    return Promise.resolve()
      .then(function() {

        if (!req.accessToken) {
          return {
            message: 'Not logged in'
          };
        }

        return Model.__me({
          id: req.accessToken.userId,
          fields: {
            id: true,
            name: true,
            icon: true,
            picture: true,
            username: true,
            email: true
          }
        });

      });

  };

  Model.__me = function(options) {

    var id = options.id;
    var fields = options.fields;

    var roleFields = _.get(options,'roles.fields');
    var include = _.map(Model.includeRoles,function(roleRelation) {
      roleRelation = _.cloneDeep(roleRelation);
      var scope = roleRelation.scope;
      if(roleFields){
        scope.fields = scope.fields.concat(roleFields);
        scope.fields = _.uniq(scope.fields);
      }
      console.log(roleFields,scope);
      return roleRelation;
    });
    return Model.findById(id, {
      include: include,
      fields: fields
    })
      .then(function(account) {
        if (!account) {
          return Promise.reject({
            message: 'Account not found',
            statusCode: 401
          });
        }

        account = account.__data;

        //console.log(account);

        var roles = _.pick(account, Model.roleKeys);
        account = _.omit(account, Model.roleKeys.concat(['password']));

        //console.log(roles);

        for (var roleKey in roles) {
          var role = {};
          if(roleFields){
            role =_.pick(roles[roleKey],roleFields);
          }
          var config = rolesConfig[roleKey];
          if (config.form) {
            role.editable = true;
          }
          roles[roleKey] = role;
        }

        account.role = roles;

        return account;

      });

  };


  Model.remoteMethod(
    'me', {
      description: 'View current user profile.',
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
        verb: 'get',
        path: '/me'
      },
    }
  );

};
