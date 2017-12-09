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
  config: path.join(themeBase, 'config.yml')
};

// Storage
var storage = path.join(core.project, 'storage');
core.storage = {
  buckets: path.join(storage, 'buckets'),
  root: storage
};

// Portal
var portal = setStructure({
  base: path.join(core.platform, 'portal')
});

var appPortal = setStructure({
  base: path.join(core.project, 'portal')
});

//--------------------------------------------------------------------

module.exports = loadApp();

function setStructure(obj){

  obj.website = path.join(obj.base, appName);

  // website
  obj.config = path.join(obj.website, 'config.yml');
  obj.data = path.join(obj.website, 'data');
  obj.build = path.join(obj.website, 'build');
  obj.tmp = path.join(obj.website, 'tmp');
  obj.scripts = path.join(obj.website, 'scripts');
  // source
  obj.source = path.join(obj.website, 'source');
  obj.lib = path.join(obj.source, 'lib');
  obj.generated = path.join(obj.source, 'generated');
  // services
  obj.services = path.join(obj.base, 'services');
  obj.models = path.join(obj.services, 'models');

  return obj;
}

function loadApp(options) {

  options = options || {};

  var app = setStructure({
    base: options.dir || core.project
  });

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
