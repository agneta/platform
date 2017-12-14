/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/models/account/roleGet.js
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
const Promise = require('bluebird');

module.exports = function(Model, app) {

  Model.roleGet = function(roleName, req) {

    if(!req.accessToken){
      return Promise.reject({
        statusCode: 401,
        message: 'You need to be logged in to continue'
      });
    }

    return Model.__roleGet(req.accessToken.userId, roleName);

  };

  Model.__roleGet = function(id, roleName) {

    var role = Model.roleOptions[roleName];
    var roleService = role.service || {};

    return Promise.resolve()
      .then(function() {

        if (!role) {
          throw new Error('No role found: ' + roleName);
        }

        var RoleModel = app.models[role.model];

        return RoleModel.findOne({
          where: {
            accountId: id
          },
          include: roleService.include
        });

      });


  };

  Model.remoteMethod(
    'roleGet', {
      description: '',
      accepts: [{
        arg: 'roleName',
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
        path: '/role-get'
      }
    }
  );

};
