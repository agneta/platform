/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/remotes/account/filter.js
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
const _ = require('lodash');

module.exports = function(Model) {

  Model.filter = function(options) {

    var count;
    options = _.pick(options, ['emailVerified']);

    if (!_.isUndefined(options.emailVerified)) {
      if (!_.isBoolean(options.emailVerified)) {
        return Promise.reject({
          statusCode: 400,
          message: 'value is not valid: verified'
        });
      }

      if(!options.emailVerified){
        options.emailVerified = {
          neq: true
        };
      }
    }


    return Model.count(options)
      .then(function(_count) {

        count = _count;

        return Model.find({
          where: options,
          limit: 50
        });

      })
      .then(function(result) {
        return{
          accounts: result,
          count: count
        };
      });


  };

  Model.remoteMethod(
    'filter', {
      description: 'Filter accounts by given options',
      accepts: [{
        arg: 'options',
        type: 'object',
        required: true
      }],
      returns: {
        arg: 'result',
        type: 'object',
        root: true
      },
      http: {
        verb: 'get',
        path: '/filter'
      }
    }
  );

};
