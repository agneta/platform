/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/models/role_editor.js
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

module.exports = function(Model, app) {

  var mediaOptions = {
    name: 'editor',
    auth: {
      allow: ['editor']
    }
  };

  Model.io = app.socket.namespace(mediaOptions);

  var web = app.get('options').web;

  Model.contentChange = function(data, req) {

    if (!req.accessToken) {
      return Promise.reject({
        message:'Must be logged in'
      });
    }

    return Promise.resolve()
      .then(function() {

        var listener = `content-change:${data.path}:${data.id}`;

        data.actor = req.accessToken.userId;

        if (_.isString(data.value)) {
          data.value = web.app.locals.render(data.value);
        }

        Model.io.emit(listener, data);

      })
      .then(function() {
        return {
          message: 'notified socket cluster'
        };
      });


  };

  Model.remoteMethod(
    'contentChange', {
      description: 'Change content by given data',
      accepts: [{
        arg: 'data',
        type: 'object',
        required: true
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
        path: '/content-change'
      }
    }
  );

};
