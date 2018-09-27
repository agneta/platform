/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/middleware/page-private.js
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
const activity = require('./page-private/activity');

module.exports = function(app) {
  var client = app.client;
  var clientProject = client.project;
  var clientHelpers = client.app.locals;

  //-----------------------------------------------------------

  var localView = {
    base: '/' + clientProject.config.page.viewBase.local + '/'
  };

  var defaultView = {
    base: '/' + clientProject.config.page.viewBase.default + '/'
  };
  switch (app.web.services.get('env')) {
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
          return app.models.Account.hasRoles(data.page.authorization, req).then(
            function(result) {
              //console.log('app.models.Account.hasRoles.result',result);

              if (!result.has) {
                var authPath = path.parse(data.remotePath);
                var name;

                if (data.page.isView) {
                  name = 'view-auth';
                }

                if (data.page.isViewData) {
                  name = 'view-auth-data';
                }

                if (!name) {
                  return Promise.reject({
                    redirect: true
                  });
                }

                authPath = urljoin(authPath.dir, name);
                data.remotePath = authPath;
                data.page = clientHelpers.get_page(data.remotePath);
              }
            }
          );
        }
      })
      .then(function() {
        return data.view.method(data);
      })
      .then(function() {
        return activity({
          app: app,
          req: req,
          data: data
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
