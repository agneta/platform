/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: main/generate/services.js
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
const log = require('../log');
const terminal = require('../server/terminal');
const projectPaths = require('../paths').core;
const Promise = require('bluebird');

module.exports = function() {

  terminal()
    .then(function(servers) {

      return Promise.map([{
        server: servers.servicesPortal,
        dir: projectPaths.portalProjectGenerated
      },
      {
        server: servers.servicesWebsite,
        dir: projectPaths.generated
      },
      ], function(service) {
        return service.server.locals.app.generate.methods({
          outputDir: service.dir
        });
      });

    })
    .then(function() {
      log.success('Exported Services');
    });
};
