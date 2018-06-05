/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/models/account/update.js
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

  Model.mediaUpdate = function(accountId, location, privacy) {
    var Account = Model.projectModel('Account');

    return Account.__mediaUpdate({
      location: location,
      accountId: accountId,
      privacy: privacy,
    });

  };

  Model.remoteMethod(
    'mediaUpdate', {
      description: '',
      accepts: [{
        arg: 'accountId',
        type: 'string',
        required: true
      },{
        arg: 'location',
        type: 'string',
        required: true
      },{
        arg: 'privacy',
        type: 'object',
        required: false
      },{
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
        path: '/media-update'
      }
    }
  );

};
