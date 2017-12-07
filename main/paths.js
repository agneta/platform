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
const _ = require('lodash');
//console.log('Application folder:', appName);

//--------------------------------------------------------------------

var core = {};
core.project = process.cwd();

var agneta = path.join(core.project, 'node_modules', 'agneta-platform');

core.agneta = agneta;
core.services = path.join(agneta, 'services');
core.portal = path.join(agneta, 'portal');
core.framework = path.join(agneta, 'pages');
core.scriptsFramework = path.join(core.framework, 'scripts');

// Theme
core.baseTheme = path.join(agneta, 'theme');
core.dataTheme = path.join(core.baseTheme, 'data');
core.templatesTheme = path.join(core.baseTheme, 'templates');
core.scriptsTheme = path.join(core.baseTheme, 'scripts');
core.sourceTheme = path.join(core.baseTheme, 'source');
core.assetsTheme = path.join(core.sourceTheme, 'assets');
core.configTheme = path.join(core.baseTheme, 'config.yml');

// Storage
var storage = path.join(core.project, 'storage');
core.storage = {
  buckets: path.join(storage, 'buckets'),
  root: storage
};

// Services
core.api = path.join(core.project, 'services');
core.models = path.join(core.api, 'models');

// Portal
core.portalWebsite = path.join(core.portal, 'website');
core.portalSource = path.join(core.portalWebsite, 'source');
core.portalAssets = path.join(core.portalSource, 'assets');

// Portal Project
core.portalProject = path.join(core.project, 'portal');
core.portalProjectServices = path.join(core.portalProject, 'services');
core.portalProjectSource = path.join(core.portalProject, 'source');
core.portalProjectGenerated = path.join(core.portalProjectSource, 'generated');


//--------------------------------------------------------------------


module.exports = {
  app: app,
  core: core
};

function app(options) {

  options = options || {};
  var paths = {};

  paths.base = options.dir || path.join(core.project, appName);

  paths.config = path.join(paths.base, 'config.yml');
  paths.data = path.join(paths.base, 'data');
  paths.build = path.join(paths.base, 'build');
  paths.template = path.join(paths.base, 'templates');
  paths.source = path.join(paths.base, 'source');
  paths.lib = path.join(paths.source, 'lib');
  paths.assets = path.join(paths.source, 'assets');
  paths.generated = path.join(paths.source, 'generated');
  paths.tmp = path.join(paths.base, 'tmp');
  paths.scripts = path.join(paths.base, 'scripts');

  _.extend(paths, core);

  return paths;
}
