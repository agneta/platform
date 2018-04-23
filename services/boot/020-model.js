/*   Copyright 2017 Agneta Network Applications, LLC.
*
*   Source file: services/boot/020-models.js
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
var _ = require('lodash');

module.exports = function(app) {

  var paths = app.web.services.get('options').paths;
  //console.log('paths',paths);

  var dirs = [
    paths.appPortal.models,
    path.join(__dirname, '../models'),
    path.join(app.web.services.get('services_dir'), 'models')
  ];

  var servicesInclude = app.web.services.get('services_include');

  for (var dir of servicesInclude) {
    dirs.push(path.join(dir, 'models'));
  }

  dirs = _.uniq(dirs);
  //console.log('dirs',dirs);

  var shared = {
    dirs: dirs,
    app: app,
    getModel: require('./model/get')(app)
  };

  //--------------------------------------------------------
  var remotes = require('./model/remotes')(shared);
  require('./model/remote-data')(shared);

  remotes(
    _.keys(app.models)
  );

  app.$model = {
    getByFile: require('./model/getByFile')(shared),
    remotes: remotes,
    get: shared.getModel
  };

};
