const uaParser = require('ua-parser-js');
const _ = require('lodash');
const moment = require('moment');
const path = require('path');
module.exports = function(options) {

  var app = options.app;
  var req = options.req;
  var data = options.data;

  var web = app.get('options').web;

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
