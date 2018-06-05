/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/models/account/auth/ip-add.js
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

  Model.ipAdd = function(accountId, title, address) {

    return Promise.resolve()
      .then(function() {

        return Model.getModel('Account').__get(accountId);

      })
      .then(function(account) {

        return account.ip_whitelist.create({
          title: title,
          address: address,
          createdAt: new Date()
        });

      })
      .then(function(result){
        return {
          result: result,
          message: 'You have added an IP'
        };
      });

  };

  var fields = app.form.fields({
    form: 'ip-add'
  });

  Model.beforeRemote('ipAdd',  app.form.check(fields));

  Model.remoteMethod(
    'ipAdd', {
      description: 'Add an IP to whitelist when loging in',
      accepts: [{
        arg: 'accountId',
        type: 'string',
        required: true
      },{
        arg: 'title',
        type: 'string',
        required: true
      }, {
        arg: 'address',
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
        path: '/ip-add'
      }
    }
  );

};
