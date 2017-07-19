/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/remotes/account/new.js
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

  Model.new = function(email, password) {

      return Model.create({
              email: email,
              password: password
          })
          .then(function() {
              return {
                  success: 'The account is created.'
              };
          });

  };

  Model.remoteMethod(
      'new', {
          description: 'Create user with email and password.',
          accepts: [{
              arg: 'email',
              type: 'string',
              required: true,
          }, {
              arg: 'password',
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
              path: '/new'
          }
      }
  );

};
