/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/models/account.js
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

module.exports = function(Model, app) {

  require('./account/clearLimits')(Model, app);
  require('./account/activitiesAdmin')(Model, app);
  require('./account/activateAdmin')(Model, app);
  require('./account/deactivateAdmin')(Model, app);
  require('./account/search')(Model, app);
  require('./account/filter')(Model, app);
  require('./account/get')(Model, app);
  require('./account/new')(Model, app);
  require('./account/changePasswordAdmin')(Model, app);
  require('./account/recent')(Model, app);
  require('./account/remove')(Model, app);
  require('./account/roleGetAdmin')(Model, app);
  require('./account/roleEdit')(Model, app);
  require('./account/roleAdd')(Model, app);
  require('./account/roleRemove')(Model, app);
  require('./account/roles')(Model, app);
  require('./account/total')(Model, app);
  require('./account/update')(Model, app);

  require('./account/auth/ssh-add')(Model, app);
  require('./account/auth/ssh-remove')(Model, app);
  require('./account/auth/ssh-list')(Model, app);

  require('./account/auth/cert-add')(Model, app);

};
