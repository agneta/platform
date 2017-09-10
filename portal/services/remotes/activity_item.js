/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/remotes/activity_item.js
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

  Model.remoteMethod(
    'details', {
      description: 'Get Activity by ID',
      accepts: [{
        arg: 'id',
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
        path: '/details'
      },
    }
  );

  Model.remoteMethod(
    'latest', {
      description: 'Get Latest number of activities',
      accepts: [{
        arg: 'feed',
        type: 'string',
        required: false
      }, {
        arg: 'unit',
        type: 'string',
        required: true
      }, {
        arg: 'value',
        type: 'number',
        required: false
      }, {
        arg: 'skip',
        type: 'number',
        required: false
      }, {
        arg: 'year',
        type: 'number',
        required: false
      },
      {
        arg: 'aggregate',
        type: 'string',
        required: false
      }, {
        arg: 'req',
        type: 'object',
        'http': {
          source: 'req'
        }
      }
      ],
      returns: {
        arg: 'result',
        type: 'object',
        root: true
      },
      http: {
        verb: 'get',
        path: '/latest'
      },
    }
  );

};
