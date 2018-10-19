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
    var type = req.query.type;

    Promise.resolve()
      .then(function() {
        var view = null;

        for (let _view of [defaultView, localView]) {
          if (req.path.indexOf(_view.base) === 0) {
            view = _view;
          }
        }

        if (!view) {
          return next();
        }

        var remotePath = req.path;
        remotePath = remotePath.substring(view.base.length);
        remotePath = path.normalize(remotePath);

        return clientHelpers
          .get_page(remotePath, {
            fields: {
              id: true,
              authorization: true
            }
          })
          .then(function(page) {
            if (!page) {
              return next();
            }

            if (page.authorization) {
              return app.models.Account.hasRoles(page.authorization, req).then(
                function(result) {
                  //console.log('app.models.Account.hasRoles.result',result);

                  if (!result.has) {
                    switch (type) {
                      case 'view':
                        type = 'auth';
                        break;
                      case 'viewData':
                        type = 'authData';
                        break;
                    }
                  }
                }
              );
            }
          })
          .then(function() {
            var lang = remotePath.split('/')[0];

            var data = {
              view: view,
              remotePath: remotePath,
              res: res,
              lang: lang,
              next: next,
              type: type
            };

            return data.view.method(data).then(function() {
              return activity({
                app: app,
                req: req,
                data: data
              });
            });
          });
      })
      .catch(function(err) {
        next(err);
      });
  };
};
