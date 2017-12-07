/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/utilities/dependencies/generate.js
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
var extract = require('./extract');
const Promise = require('bluebird');
module.exports = function(util) {

  var projectPaths = util.locals.web.project.paths;

  return Promise.resolve()
    .then(function() {

      return extract(util, {
        name: 'theme',
        base: projectPaths.baseTheme,
        root: projectPaths.agneta
      });

    })
    .then(function() {
      return extract(util, {
        name: 'project',
        base: projectPaths.base,
        root: process.cwd()
      });
    });

};
