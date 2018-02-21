/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/models/data_local.js
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
var path = require('path');

module.exports = function(Model, app) {

  var webPrj = app.get('options').web.project;

  Model.editConfigDir = path.join(webPrj.paths.core.project, 'edit', 'data-local');

  Model.parseId = function(id) {

    var split = id.split('/');
    var fileName = split.pop();
    var templateId = split.join('/');
    var source = path.join(webPrj.paths.app.data, templateId, fileName + '.yml');

    return {
      templateId: templateId,
      fileName: fileName,
      source: source
    };

  };

  require('./data-local/loadCommit')(Model, app);
  require('./data-local/loadOne')(Model, app);
  require('./data-local/delete')(Model, app);
  require('./data-local/save')(Model, app);
  require('./data-local/new')(Model, app);
  require('./data-local/loadMany')(Model, app);
  require('./edit/loadTemplates')(Model, app);

};
