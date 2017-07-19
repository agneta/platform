/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/server/boot/explorer.js
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
var explorer = require('loopback-component-explorer');
var urljoin = require('url-join');

module.exports = function(app) {

  if (app.get('env') == 'production') {
    return;
  }

  var base;
  var root = app.get('root');
  var apiRoot = app.get('restApiRoot');

  base = urljoin(root, apiRoot);
  if (base[0] != '/') {
    base = '/' + base;
  }
  if (base[1] == '/') {
    base = base.substring(1);
  }

  app.use('/explorer', explorer.routes(app, {
    basePath: base
  }));
};
