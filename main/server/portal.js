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
const express = require('express');
const path = require('path');
const start = require('../start');
const config = require('../config');
const middleware = require('../middleware');
const projectPaths = require('../paths').project;
const Build = require(path.join(projectPaths.framework, 'core/build'));

module.exports = function(options) {

  var server = options.server;
  var app = options.app;
  //-------------------------------------

  var commonOptions = _.extend({
    mainApp: app,
    worker: options.worker,
    appName: config.appName,
    server: server
  }, config);

  const appRoots = {
    preview: 'preview/real-time',
    local: 'preview/local',
    production: 'preview/production'
  };

  const url_services = '/services';
  // Ensure secure connection when not in development mode

  app.set('trust proxy', 1);

  if (app.get('env') != 'development') {

    app.use(function(req, res, next) {
      if (!req.secure) {
        var secureUrl = 'https://' + req.headers.host + req.url;
        res.writeHead(301, {
          'Location': secureUrl
        });
        res.end();
        return;
      }
      next();
    });

  }

  //-----------------------------------------------------

  app.use('/' + appRoots.local, staticMiddleware('local/public'));
  app.use('/', express.static(
    path.join(projectPaths.portalProject)
  ));

  function staticMiddleware(name) {
    return function(req, res, next) {

      var parsed = path.parse(req.path);
      if (!parsed.ext) {
        res.set('content-encoding', 'gzip');
      }
      express.static(path.join(projectPaths.build, name))(
        req,
        res,
        next);
    };

  }

  //-----------------------------------------------------

  // Setup the preview components

  var portalServices = middleware(_.extend({
    title: 'Portal Services',
    root: '',
    name: 'services',
    id: 'portal',
    include: path.join(projectPaths.project, 'services'),
    dir: projectPaths.portal,
    website: {}
  }, commonOptions));

  var portalPages = middleware(_.extend({
    root: '',
    dir: projectPaths.portalWebsite,
    name: 'portal',
    title: 'Portal Pages'
  }, commonOptions));

  var webServices = middleware(_.extend({
    title: 'Web Services',
    root: 'services',
    name: 'services',
    id: 'web',
    disableSocket: true,
    dir: projectPaths.project,
    website: {
      root: appRoots.preview
    }
  }, commonOptions));

  var webPages = middleware(_.extend({
    root: appRoots.preview,
    url_services: url_services,
    name: 'website',
    title: 'Web Pages'
  }, commonOptions));

    // Share apps

  portalServices.locals.client = portalPages.locals;
  portalServices.locals.web = webPages.locals;
  webServices.locals.client = webPages.locals;

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
      paths: projectPaths,
      mode: 'default',
      locals: _.extend({}, config, {
        root: websiteRoot,
        url_services: url_services,
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
      dir: projectPaths.portal,
      include: path.join(projectPaths.project, 'services')
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
  ]);

};
