/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/middleware/page-private/activity.js
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
const uaParser = require('ua-parser-js');
const _ = require('lodash');
const moment = require('moment');
const path = require('path');
module.exports = function(options) {

  var app = options.app;
  var req = options.req;
  var data = options.data;

  var web = app.web;

  if (web) {
    return;
  }

  var accountId = (req.accessToken && req.accessToken.userId);
  var ua = uaParser(req.dataParsed.agent);

  var parsed = path.parse(data.remotePath);
  var pagePath = app.helpers.slugifyPath(parsed.dir);
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

    })
    .catch(function(err) {
      console.error('Activity Error:',err);
    });

};
