/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/lib/form.js
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

  app.form = {};

  var client = app.web || app.client;
  var clientHelpers = client.app.locals;

  require('./fields')(app, clientHelpers);
  require('./check')(app, clientHelpers);
  require('./load')(app, clientHelpers);
  require('./newMethod')(app);
};
