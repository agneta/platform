/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: main/paths.js
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
const appName = process.env.APP_NAME || 'website';
//console.log('Application folder:', appName);

//--------------------------------------------------------------------

var core = {};
core.project = process.cwd();

core.platform = path.join(__dirname, '..');
core.services = path.join(core.platform, 'services');
core.portal = path.join(core.platform, 'portal');
core.models = path.join(core.services, 'models');

// Base
var pages = {};
pages.base = path.join(core.platform, 'pages');
pages.scripts = path.join(pages.base, 'scripts');

// Theme
var themeBase = path.join(core.platform, 'theme');
var theme = {
  base: themeBase,
  data: path.join(themeBase, 'data'),
  templates: path.join(themeBase, 'templates'),
  scripts: path.join(themeBase, 'scripts'),
  source: path.join(themeBase, 'source'),
  assets: path.join(themeBase, 'source', 'assets'),
  config: path.join(themeBase, 'config.yml')
};

// Storage
var storage = path.join(core.project, 'storage');
core.storage = {
  buckets: path.join(storage, 'buckets'),
  root: storage
};

// Portal
var portal = {};
portal.website = path.join(core.portal, 'website');
portal.source = path.join(portal.website, 'source');
portal.assets = path.join(portal.source, 'assets');

//--------------------------------------------------------------------

module.exports = {
  app: loadApp,
  core: core,
  pages: pages,
  theme: theme,
  portal: portal
};

function loadApp(options) {

  options = options || {};

  var app = {};

  app.base = options.dir || path.join(core.project, appName);

  app.config = path.join(app.base, 'config.yml');
  app.data = path.join(app.base, 'data');
  app.build = path.join(app.base, 'build');
  app.source = path.join(app.base, 'source');
  app.lib = path.join(app.source, 'lib');
  app.assets = path.join(app.source, 'assets');
  app.generated = path.join(app.source, 'generated');
  app.tmp = path.join(app.base, 'tmp');
  app.scripts = path.join(app.base, 'scripts');
  app.services = path.join(core.project, 'services');

  //----------------------------

  var appPortal = {};
  appPortal.base = path.join(core.project, 'portal');
  appPortal.services = path.join(appPortal.base, 'services');
  appPortal.source = path.join(appPortal.base, 'source');
  appPortal.generated = path.join(appPortal.source, 'generated');

  return {
    app: app,
    appPortal: appPortal,
    core: core,
    pages: pages,
    theme: theme,
    portal: portal
  };
}
