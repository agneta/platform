/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: main/server/terminal.js
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
var projectPaths = require('../paths');
var start = require('../start');
var _ = require('lodash');

module.exports = function() {
  process.env.MODE = 'terminal';

  var webPages = start.normal();
  var webPortal = start.normal({
    dir: projectPaths.portal.base
  });

  var commonOptions = {};

  var servicesPortal = start.services(
    _.extend(
      {
        dir: projectPaths.portal.base
      },
      commonOptions
    )
  );

  var servicesWebsite = start.services(
    _.extend(
      {
        dir: projectPaths.core.project
      },
      commonOptions
    )
  );

  servicesWebsite.locals.client = webPages.locals;

  servicesPortal.locals.client = webPortal.locals;
  servicesPortal.locals.web = webPages.locals;

  webPages.locals.portal = servicesPortal.locals.app;
  webPages.locals.services = servicesWebsite.locals.app;

  webPortal.locals.web = webPages.locals;
  webPortal.locals.services = servicesPortal.locals.app;

  var subApps = [servicesWebsite, servicesPortal, webPages, webPortal];

  return start.init(subApps).then(function() {
    return {
      servicesPortal: servicesPortal,
      servicesWebsite: servicesWebsite,
      webPages: webPages,
      webPortal: webPortal
    };
  });
};
