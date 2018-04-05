/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/models/account/search.js
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

module.exports = function(Model) {


  Model.search = function(query) {

    var findWhere = {
      $text: {
        $search: query
      }
    };

    var findFields = {
      score: {
        $meta: 'textScore'
      },
      password: false,
      verificationToken: false
    };
    var Account = Model.getModel('Account');

    return Account.getCollection()
      .find(findWhere, findFields)
      .sort({
        score: {
          $meta: 'textScore'
        }
      })
      .limit(10)
      .toArray()
      .then(function(accounts) {

        return Promise.map(accounts, function(account) {

          account.id = account._id;
          delete account._id;

          return account;

        });
      })
      .then(function(accounts) {
        return {
          accounts: accounts
        };
      });

  };

  Model.remoteMethod(
    'search', {
      description: 'Find a user',
      accepts: [{
        arg: 'query',
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
        path: '/search'
      }
    }
  );

};
