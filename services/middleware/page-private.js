/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/server/middleware/page-private.js
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
const Promise = require('bluebird');
const urljoin = require('url-join');
const uaParser = require('ua-parser-js');
const _ = require('lodash');
const moment = require('moment');

module.exports = function(app) {

  var client = app.get('options').client;
  var web = app.get('options').web;
  var clientProject = client.project;
  var clientHelpers = client.app.locals;

  //-----------------------------------------------------------

  var localView = {
    base: '/' + clientProject.config.page.viewBase.local + '/'
  };

  var defaultView = {
    base: '/' + clientProject.config.page.viewBase.default+'/'
  };
  switch (app.get('env')) {
    case 'development':
      defaultView.method = require('./page-private/preview')(app);
      localView.method = require('./page-private/local')(app);
      break;
    default:
      defaultView.method = require('./page-private/deployed')(app);
  }

  //-----------------------------------------------------------

  return function(req, res, next) {

    var data;

    checkBase(defaultView);
    checkBase(localView);

    function checkBase(view) {

      if (req.path.indexOf(view.base) !== 0) {
        return;
      }

      var remotePath = req.path;
      remotePath = remotePath.substring(view.base.length);
      remotePath = path.normalize(remotePath);

      var page = clientHelpers.get_page(remotePath);
      var lang = remotePath.split('/')[0];

      data = {
        view: view,
        remotePath: remotePath,
        page: page,
        res: res,
        lang: lang,
        next: next
      };
    }

    if (!data) {
      return next();
    }

    if (!data.page) {
      return next();
    }

    return Promise.resolve()
      .then(function() {
        if (data.page.authorization) {

          //console.log('page:private:auth',data.page.title, data.page.authorization);
          return app.models.Account.hasRoles(
            data.page.authorization,
            req
          )
            .then(function(result) {
              console.log('app.models.Account.hasRoles.result',result);
              console.log('app.models.Account.hasRoles.result',result);

              if (!result.has) {

                var authPath = path.parse(data.remotePath);
                var name;

                if (data.page.isView) {
                  name = 'view-auth';
                }

                if (data.page.isViewData) {
                  name = 'view-auth-data';
                }

                if(!name){
                  return Promise.reject({
                    redirect: true
                  });
                }

                authPath = urljoin(authPath.dir, name);
                data.remotePath = authPath;
                data.page = clientHelpers.get_page(data.remotePath);
                console.log(authPath,data.page);
              }
            });
        }

      })
      .then(function() {
        return data.view.method(data);
      })

    //---------------------------------------------------------
    // ANALYTICS

      .then(function() {

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

          });

      })
      .catch(function(err) {
        if (err.redirect) {
          return res.redirect(`/gr/authorization?redirect=${req.originalUrl}`);
        }
        if (err.notfound) {
          return next();
        }
        next(err);
      });

  };
};
