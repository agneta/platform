/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/models/account/auth/ip-remove.js
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

  Model.ipRemove = function(accountId,ipId) {

    var Account = Model.getModel('Account');

    return Promise.resolve()
      .then(function() {
        return Account.__get(accountId);
      })
      .then(function(account) {
        return account.ip_whitelist.findById(ipId);
      })
      .then(function(result) {
        if(!result){
          return Promise.reject({
            message: 'IP not found',
            statusCode: 401
          });
        }
        return result.destroy();
      })
      .then(function(){
        return {
          message: 'IP removed from account'
        };
      });

  };

  Model.remoteMethod(
    'ipRemove', {
      description: 'Remove an IP from the account\'s whitelist',
      accepts: [{
        arg: 'accountId',
        type: 'string',
        required: true
      },{
        arg: 'ipId',
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
        path: '/ip-remove'
      }
    }
  );

};
