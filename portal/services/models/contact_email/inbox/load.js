/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/models/email_template/getAll.js
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

  Model.inboxLoad = function(emailId) {

    return Model.findById(emailId)
      .then(function(result) {
        return result;
      });

  };

  Model.remoteMethod(
    'inboxLoad', {
      description: 'Load email from inbox',
      accepts: [{
        arg: 'emailId',
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
        path: '/inbox-load'
      }
    }
  );

};
