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
const yaml = require('js-yaml');
const fs = require('fs-extra');
const extensions = require('./extensions');
const structure = require('./structure');
//console.log('Application folder:', appName);

//--------------------------------------------------------------------

var core = {};
core.project = process.cwd();
core.platform = path.join(__dirname, '../..');
core.services = path.join(core.platform, 'services');
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
  scripts: path.join(themeBase, 'scripts'),
  source: path.join(themeBase, 'source'),
  config: path.join(themeBase, 'config.yml'),
  email: path.join(themeBase, 'email')
};

// Storage
core.storage = path.join(core.project, '.agneta', 'storage');
// Portal
var portal = structure({
  base: path.join(core.platform, 'portal')
});

var appPortal = structure({
  base: path.join(core.project,'portal')
});

//--------------------------------------------------------------------

module.exports = loadApp();

function loadApp(options) {

  options = options || {};

  var base = options.dir || core.project;
  var app = structure({
    base: base
  });

  var appConfig = fs.readFileSync(app.config,'utf8');
  appConfig = yaml.safeLoad(appConfig);

  //----------------------------

  app.extensions = extensions({
    config: appConfig,
    paths: app
  });
  app.cache = path.join(app.website, 'cache');

  return {
    app: app,
    appPortal: appPortal,
    core: core,
    pages: pages,
    theme: theme,
    portal: portal,
    loadApp: loadApp
  };


}
