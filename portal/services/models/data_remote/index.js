/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/models/data_remote.js
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

  var webPrj = app.web.project;

  Model.editConfigDir = path.join(webPrj.paths.core.project, 'edit', 'data-remote');

  Model.getTemplateModel = function(template){

    return Promise.resolve()
      .then(function() {
        var templateConfig = app.dataRemote[template];

        if(!templateConfig){
          return Promise.reject({
            statusCode: 404,
            message: `Template config not found with name ${template}`
          });
        }
        return app.models[templateConfig.modelName];
      });

  };
  require('./loadCommit')(Model, app);
  require('./loadOne')(Model, app);
  require('./delete')(Model, app);
  require('./save')(Model, app);
  require('./new')(Model, app);
  require('./loadMany')(Model, app);
  require('../edit/loadTemplate')(Model, app);
  require('../edit/loadTemplates')(Model, app);

};
