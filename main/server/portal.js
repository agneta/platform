/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: main/server/portal.js
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
const _ = require('lodash');
const path = require('path');
const start = require('../start');
const config = require('../config');
const middleware = require('../middleware');
const projectPaths = require('../paths')
  .core;
const Build = require(path.join(projectPaths.framework, 'core/build'));

module.exports = function(options) {

  var server = options.server;
  var app = options.app;
  //-------------------------------------

  var commonOptions = _.extend({
    mainApp: app,
    worker: options.worker,
    server: server
  }, config);

  const appRoots = {
    preview: 'services/preview/real-time',
    local: 'services/preview/local'
  };
  // Ensure secure connection when not in development mode

  app.set('trust proxy', 1);

  //-----------------------------------------------------
  // Setup the preview components

  function setupServer(name,options){
    var component = start[name](_.extend(options, commonOptions));

    return middleware({
      component: component,
      root: options.root,
      mainApp: options.mainApp || app,
      detached: options.detached
    });
  }

  var portalServices = setupServer('services',{
    root: 'services',
    id: 'portal',
    include: [
      projectPaths.api,
      projectPaths.portalProjectServices
    ],
    dir: projectPaths.portal,
    website: {}
  });

  var portalPages = setupServer('portal',{
    root: '',
    dir: projectPaths.portalWebsite,
  });

  var webServices = setupServer('services',{
    root: 'services/preview/services',
    id: 'web',
    dir: projectPaths.project,
    website: {
      root: appRoots.preview
    },
    detached: true
  });

  var webPages = setupServer('website',{
    root: appRoots.preview,
    detached: true
  });

  //-----------------------------------------------------
  // Share apps

  portalServices.locals.client = portalPages.locals;
  portalServices.locals.web = webPages.locals;
  webServices.locals.client = webPages.locals;
  webServices.locals.portal = portalServices.locals;

  portalPages.locals.services = portalServices.locals.app;
  portalPages.locals.web = webPages.locals;

  webPages.locals.portal = portalServices.locals.app;
  webPages.locals.services = webServices.locals.app;

  //----------------------------------------------------------------

  webPages.locals.build = function(options) {

    options = options || {};
    options.env = options.env || 'local';

    var websiteRoot = null;

    switch (options.env) {
      case 'local':
        websiteRoot = appRoots.local;
        break;
      default:
    }

    var buildPages = start.pages({
      mode: 'default',
      locals: _.extend({}, config, {
        root: websiteRoot,
        buildOptions: {
          assets: true,
          pages: true
        }
      })
    });

    var buildServices = start.services({
      website: {
        root: websiteRoot
      },
      building: true,
      dir: projectPaths.project
    });

    buildServices.locals.env = options.env;
    buildPages.locals.env = options.env;

    buildServices.locals.client = buildPages.locals;
    buildServices.locals.web = buildPages.locals;

    buildPages.locals.services = buildServices.locals.app;
    buildPages.locals.portal = buildServices.locals.app;

    var build = Build(buildPages.locals);

    return start.init([
      buildServices,
      buildPages
    ])
      .then(function() {
        return build(options);
      });

  };

  // Start using apps

  return start.init([
    webServices,
    portalServices,
    webPages,
    portalPages,
  ])
    .then(function() {
      return {
        portalSettings: _.pick(portalServices.locals.app.settings,[
          'account'
        ])
      };
    });

};
