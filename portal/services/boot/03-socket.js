/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/boot/03-socket.js
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
module.exports = function(app) {

    if (!app.socket) {
        return;
    }

    //-------------------------------------------

    var mediaOptions = {
        name: 'media',
        auth: {
            allow: ['editor']
        }
    };

    app.models.Media_Private.io = app.socket.namespace(mediaOptions);
    app.models.Media.io = app.socket.namespace(mediaOptions);

    //-------------------------------------------

    app.models.Utility.io = app.socket.namespace({
        name: 'utilities',
        auth: {
            allow: [
                'administrator'
            ]
        }
    });

    //-------------------------------------------

    app.portal = app.portal || {};

    app.portal.socket = app.socket.namespace({
        name: 'portal'
    });

    //-------------------------------------------

    require('./socket/memory')(app);
    require('./socket/activity')(app);
    require('./socket/editor')(app);
    require('./socket/activities')(app);

};
