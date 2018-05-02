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

  var dirs = app.get('services_include')
    .map(function(dir) {
      return path.join(dir, 'models');
    });

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
