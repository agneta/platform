/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/server/remotes/account/signOutAll.js
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
const path = require('path');
const eRecaptcha = require('express-recaptcha');
const loopback = require('loopback');
const utils = require('loopback/lib/utils');
const _ = require('lodash');
const assert = require('assert');
const urljoin = require('urljoin');

module.exports = function(Model, app) {

    Model.signOutAll = function(req) {

        var AccessToken = app.models.AccessToken;
        return AccessToken.destroyAll({
                userId: req.accessToken.userId
            })
            .then(function() {

                Model.activity({
                    req: req,
                    action: "logout_all"
                });

                return {
                    success: 'Cleared all access tokens'
                };
            });

    };

    Model.remoteMethod(
        'signOutAll', {
            description: 'Clear all tokens from this account',
            accepts: [{
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
                path: '/sign-out-all'
            }
        }
    );

    Model.afterRemote('signOutAll', Model.removeLoginCookie);

};
