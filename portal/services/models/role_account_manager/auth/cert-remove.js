/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/models/account/auth/cert-remove.js
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

  Model.certRemove = function(accountId,certId) {

    var Account = Model.getModel('Account');

    return Promise.resolve()
      .then(function() {
        return Account.__get(accountId);
      })
      .then(function(account) {
        return account.cert.findById(certId);
      })
      .then(function(result) {
        if(!result){
          return Promise.reject({
            message: 'Certificate not found',
            statusCode: 401
          });
        }
        return result.destroy();
      })
      .then(function(){
        return {
          message: 'Certificate removed from account'
        };
      });

  };

  Model.remoteMethod(
    'certRemove', {
      description: 'Remove a certificate from a scpecified account',
      accepts: [{
        arg: 'accountId',
        type: 'string',
        required: true
      },{
        arg: 'certId',
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
        path: '/cert-remove'
      }
    }
  );

};
