/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/boot/socket/editor.js
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
var _ = require('lodash');

module.exports = function(app) {

    var socket = app.portal.socket;
    var web = app.get('options').web;
    socket.on('connection', function(connection) {
        connection.on('content-change', function(data) {

            var accessToken = connection.request.accessToken;
            var listener = `content-change:${data.path}:${data.id}`;

            if(!accessToken){
              return;
            }

            data.actor = accessToken.userId;

            if(_.isString(data.value)){
                data.value = web.app.locals.render(data.value);
            }

            socket.emit(listener, data);

        });

    });

};
