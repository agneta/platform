/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/server/remotes/email_template/getAll.js
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

module.exports = function(Model) {

  Model.getAll = function() {

    return Promise.resolve()
      .then(function() {
        return {
          list: _.keys(Model.__email.templates)
        };
      });

  };

  Model.remoteMethod(
    'getAll', {
      description: 'Return all email templates',
      accepts: [],
      returns: {
        arg: 'result',
        type: 'object',
        root: true
      },
      http: {
        verb: 'get',
        path: '/get-all'
      }
    }
  );

};
