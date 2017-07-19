/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/server/remotes/activity_feed/getInfo.js
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
var Promise = require("bluebird");
var _ = require("lodash");
var randomColor = require('randomcolor');

module.exports = function(Model, app) {

    var activities = app.get('activities');
    var clientHelpers = app.get('options');
    clientHelpers = clientHelpers.web || clientHelpers.client;
    clientHelpers = clientHelpers.app.locals;

    var infoMethods = {};

    Model.registerInfo = function(type, method) {

        infoMethods[type] = method;
    };

    Model.getInfo = function(feed, req) {

        return Promise.resolve()
            .then(function() {
                if (!feed.color) {
                    return feed.updateAttribute('color',
                        randomColor({
                            luminosity: 'light',
                            format: 'rgbArray'
                        })
                    );
                }
                return feed;
            })
            .then(function(result) {

                feed = result.__data || result;

                var method = infoMethods[feed.type];
                if (!method) {
                    return feed;
                }
                return method(feed, req);

            })
            .then(function(result) {
                return result || feed;
            });

    };

    //----------------------------------------------

    Model.registerInfo('view_page', getPage);
    Model.registerInfo('search_page', getPage);

    function getPage(feed, req) {
        var page = clientHelpers.get_page(feed.value);
        if (page) {
            feed.title = app.lng(page.title, req);
            feed.subtitle = page.path;
        }

    }

    //----------------------------------------------

    Model.registerInfo('form', function(feed, req) {

        if (!app.models.Form.formServices) {
            return;
        }

        var formMethod = app.models.Form.formServices.methods[feed.value];

        if (!formMethod) {
            return;
        }
        var form = formMethod.data;
        if (!form) {
            return;
        }

        feed.title = app.lng(form.title, req);
    });

    //----------------------------------------------

    Model.registerInfo('action', function(feed, req) {
        var action = activities.action[feed.value];
        if (action) {
            feed.title = app.lng(action.title, req);
            feed.icon = action.icon;
        }
    });

    //----------------------------------------------

    Model.registerInfo('account', function(feed, req) {
        var id = feed.value.split('_')[1];
        if (!id) {
            return;
        }
        feed.icon = "material/account-circle";
        return app.models.Account.findById(id)
            .then(function(result) {
                if (!result) {
                    return;
                }
                feed.title = result.name;
                feed.subtitle = result.email;
            });
    });

};
