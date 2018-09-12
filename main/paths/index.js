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
const frontend = require('./frontend');
const extensions = require('./extensions');
const structure = require('./structure');
//console.log('Application folder:', appName);

//--------------------------------------------------------------------
var url = {
  preview: {}
};
url.preview.local = 'services/preview/local';
url.preview.dev = 'services/preview/real-time';
url.preview.services = 'services/preview/services';

var core = {};
core.project = process.cwd();
core.source = path.join(__dirname, '../../..');
core.platform = path.join(core.source, 'dist');
core.services = path.join(core.platform, 'services');
core.models = path.join(core.services, 'models');
core.email = path.join(core.source, 'services/email');
core.tmp = path.join(core.project, 'tmp');

// Base
var pages = {};
pages.base = path.join(core.platform, 'pages');
pages.scripts = path.join(pages.base, 'scripts');

// Storage
core.storage = path.join(core.project, '.agneta', 'storage');

var common = structure.init({
  base: path.join(core.project, 'common')
});

const portal = require('./portal')({
  core: core
});

//--------------------------------------------------------------------

module.exports = loadApp();

function loadApp(options) {
  options = options || {};

  var base = options.dir || core.project;
  var app = structure.init({
    base: base
  });

  var appConfig = {};

  if (fs.existsSync(app.config)) {
    appConfig = fs.readFileSync(app.config, 'utf8');
    appConfig = yaml.safeLoad(appConfig);
  }

  var data = {
    config: appConfig,
    paths: app,
    core: core
  };

  app.frontend = frontend(data);
  app.extensions = extensions(data);

  app.cache = path.join(app.website, 'cache');

  return {
    app: app,
    url: url,
    appPortal: portal.app,
    core: core,
    pages: pages,
    common: common,
    portal: portal.main,
    loadApp: loadApp
  };
}
