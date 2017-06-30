const path = require('path');
const fs = require('fs');
const Promise = require('bluebird');
const urljoin = require('url-join');
const uaParser = require('ua-parser-js');
const request = require('request');
const _ = require('lodash');
const moment = require('moment');

module.exports = function(app) {

    var basePath = '/views/';
    var sendFile;
    var website = app.get('website');
    var client = app.get('options').client;
    var clientProject = client.project;
    var clientHelpers = client.app.locals;

    return function(req, res, next) {

        var remotePath = req.path;

        if (remotePath.indexOf(basePath) !== 0) {
            return next();
        }

        remotePath = remotePath.substring(basePath.length);
        remotePath = path.normalize(remotePath);

        var parsed = path.parse(remotePath);
        parsed = path.parse(remotePath);

        var streamPath = urljoin(website.url, remotePath);
        var page = clientHelpers.get_page(remotePath) || {};

        return Promise.resolve()
            .then(function() {

                if (page.authorization) {

                    return app.models.Account.hasRoles(
                            page.authorization,
                            req
                        )
                        .then(function(result) {
                            if (!result.has) {
                                streamPath = path.parse(streamPath);
                                streamPath = urljoin(streamPath.dir, 'view-auth');
                            }
                        });
                }

            })
            .then(function() {

                var stream = request({
                    uri: streamPath
                });

                req.pipe(stream).pipe(res);

                var accountId = (req.accessToken && req.accessToken.userId);
                var ua = uaParser(req.dataParsed.agent);
                var pagePath = app.helpers.fixPath(parsed.dir);
                var feeds = [{
                    value: pagePath,
                    type: 'view_page'
                }];

                // IP
                if (req.ip) {
                    feeds.push({
                        value: req.ip,
                        type: 'view_ip'
                    });
                }

                // Broswer
                if (ua.browser.name) {
                    feeds.push({
                        value: ua.browser.name,
                        type: 'view_browser'
                    });
                }

                if (ua.browser.name && ua.browser.major) {
                    feeds.push({
                        value: ua.browser.name + ':' + ua.browser.major,
                        type: 'view_browser_version'
                    });
                }

                // Operating System
                if (ua.os.name) {
                    feeds.push({
                        value: ua.os.name,
                        type: 'view_os'
                    });
                }
                if (ua.os.name && ua.os.version) {
                    feeds.push({
                        value: ua.os.name + ':' + ua.os.version,
                        type: 'view_os_version'
                    });
                }

                // Device
                if (ua.device.vendor) {
                    feeds.push({
                        value: ua.device.vendor,
                        type: 'view_vendor'
                    });
                }
                if (ua.device.vendor && ua.device.model) {
                    feeds.push({
                        value: ua.device.vendor + ':' + ua.device.model,
                        type: 'view_vendor_model'
                    });
                }
                if (ua.device.type) {
                    feeds.push({
                        value: ua.device.type,
                        type: 'view_device'
                    });
                }

                //--------------------------------------------

                var sessionActivity;

                Promise.resolve()
                    .then(function() {

                        if (req.session.visited) {

                            if (req.session.activityId) {

                                return app.models.Activity_Item.findById(req.session.activityId);

                            }


                        } else {

                            req.session.visited = true;

                            var activityOptions = {
                                action: {
                                    value: 'create',
                                    type: 'session'
                                },
                                req: req,
                                data: {
                                    created: moment().utc().toString()
                                }
                            };

                            return req.app.models.Activity_Item.new(activityOptions)
                                .then(function(activity) {
                                    req.session.activityId = activity.id;
                                    return activity;
                                });

                        }

                    }).then(function(_sessionActivity) {

                        sessionActivity = _sessionActivity;

                        //--------------------------------------------

                        var options = {
                            feeds: feeds,
                            action: 'page_view',
                            req: req,
                            data: {
                                path: pagePath
                            }
                        };

                        if (accountId) {
                            options.accountId = accountId;
                        }

                        return req.app.models.Activity_Item.new(options);


                    })
                    .then(function(viewActivity) {

                        if (sessionActivity) {

                            var views = sessionActivity.__data.data.views || [];
                            views.push(viewActivity.id);
                            var data = _.extend(sessionActivity.__data.data, {
                                views: views
                            });
                            return sessionActivity.updateAttribute('data', data);

                        }

                    });

            });


    };
};
