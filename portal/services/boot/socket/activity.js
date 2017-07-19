/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/boot/socket/activity.js
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
var prettyBytes = require('pretty-bytes');
var _ = require('lodash');

module.exports = function(app) {

    var socket = app.portal.socket;

    app.models.Activity_Item.observe('after save', function(ctx) {

        var instance = ctx.instance;

        var response = {
            time: instance.time,
            actionId: instance.actionId,
        };

        if (instance.accountId) {
            app.models.Account.findById(instance.accountId)
                .then(function(account) {
                    response.account = account;
                    socket.emit('activity:new', response);
                });
        }


    });

};
