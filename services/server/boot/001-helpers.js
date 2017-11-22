/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/lib/helpers.js
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

module.exports = function(app) {

  app.helpers = {
    mediaType: require('./helpers/mediaType'),
    slugifyPath: require('./helpers/slugifyPath'),
    normalizePath: require('./helpers/normalizePath'),
    dropCollection: require('./helpers/dropCollection')(app),
    limitObject: require('./helpers/limitObject'),
    resubmitPassword: require('./helpers/resubmitPassword')(app)
  };
};
