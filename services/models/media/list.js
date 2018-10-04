/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/models/media/list.js
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
module.exports = function(Model, app) {
  const list = app.query.list({
    model: Model,
    pathProp: 'location'
  });

  Model.list = function(dir, marker) {
    return list({
      dir: dir,
      limit: 20,
      marker: marker
    });
  };

  Model.remoteMethod('list', {
    description: 'List the files',
    accepts: [
      {
        arg: 'dir',
        type: 'string',
        required: false
      },
      {
        arg: 'marker',
        type: 'number',
        required: false
      }
    ],
    returns: {
      arg: 'result',
      type: 'object',
      root: true
    },
    http: {
      verb: 'post',
      path: '/list'
    }
  });
};
