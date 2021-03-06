/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: main/server/services.js
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

var projectPaths = require('../paths').core;
var config = require('../config');
var start = require('../start');

module.exports = function(options) {
  options = options || {};

  var webPages = start.normal({
    locals: {
      load: {
        media: false
      },
      host: config.host
    }
  });

  var services = start.services({
    io: options.io,
    dir: projectPaths.project,
    client: webPages.locals,
    server: options.server,
    app: options.app
  });

  webPages.locals.services = services.locals.app;
  services.locals.client = webPages.locals;
  options.app.use(services.locals.app);

  return start.init([services, webPages]).then(function() {
    return {
      webPages: webPages,
      services: services
    };
  });
};
