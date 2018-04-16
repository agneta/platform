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
const start = require('../start');
const middleware = require('../middleware');
const paths = require('../paths');

module.exports = function(options) {

  var server = options.server;
  var app = options.app;
  //-------------------------------------

  var commonOptions = {
    mainApp: app,
    worker: options.worker,
    server: server
  };
  //-----------------------------------------------------
  // Setup the preview components

  function setupServer(name,options){
    var component = start[name](_.extend(options, commonOptions));

    return middleware({
      component: component,
      root: options.root,
      mainApp: options.mainApp || app
    });
  }

  var storage = require('./storage')({
  });

  var portalServices = setupServer('services',{
    root: 'services',
    id: 'portal',
    include: [
      paths.app.services,
      paths.appPortal.services
    ],
    dir: paths.portal.base,
    website: {}
  });

  var portalPages = setupServer('portal',{
    root: '',
    dir: paths.portal.base,
  });

  var webServices = setupServer('services',{
    root: paths.url.preview.services,
    id: 'web',
    dir: paths.core.project,
    website: {
      root: paths.url.preview.dev
    },
    detached: true
  });

  var webPages = setupServer('website',{
    root: paths.url.preview.dev,
    detached: true
  });

  //-----------------------------------------------------
  // Share apps

  portalServices.locals.client = portalPages.locals;
  portalServices.locals.web = webPages.locals;
  portalServices.locals.storage = storage.locals;

  webServices.locals.client = webPages.locals;
  webServices.locals.portal = portalServices.locals;
  webServices.locals.storage = storage.locals;

  portalPages.locals.services = portalServices.locals.app;
  portalPages.locals.web = webPages.locals;

  webPages.locals.portal = portalServices.locals.app;
  webPages.locals.services = webServices.locals.app;
  webPages.locals.build = require('./build');

  storage.locals.services = webServices.locals;

  //----------------------------------------------------------------
  // Start using apps

  return start.init([
    webServices,
    storage,
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
