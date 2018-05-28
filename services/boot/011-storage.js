/*   Copyright 2017 Agneta Network Applications, LLC.
*
*   Source file: services/boot/011-storage.js
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

  var config = app.web.services.get('storage');

  if (!config) {
    return;
  }

  switch(config.provider){
    case 'aws':
      app.storage = require('./storage/amazon')(app,config);
      break;
    case 'local':
      app.storage = require('./storage/local')(app);
      break;
    default:
      throw new Error(`Uknown provider "${config.provider}" for storage service`);
  }

  require('./storage/helpers/listAllKeys')(app);
  require('./storage/helpers/moveObject')(app);

};
