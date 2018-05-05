/*   Copyright 2017 Agneta Network Applications, LLC.
*
*   Source file: portal/services/models/data-remote/loadMany.js
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

  Model.loadMany = function(template, order, req) {

    return Model.__display({
      template: template,
      order: order,
      req: req
    });

  };


  Model.remoteMethod(
    'loadMany', {
      description: 'Load all remote data with specified template',
      accepts: [{
        arg: 'template',
        type: 'string',
        required: true
      }, {
        arg: 'order',
        type: 'string',
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
        verb: 'get',
        path: '/load-many'
      },
    }
  );

};
