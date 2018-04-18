/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/models/media/main.js
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
const path = require('path');

module.exports = function(Model, app, options) {

  var mediaOptions = {
    name: 'media',
    auth: {
      allow: ['editor']
    }
  };

  Model.io = app.socket.namespace(mediaOptions);

  Model.__tempUploads = path.join('temp/uploads', options.name);
  Model.__bucket = options.bucket;
  Model.__name = options.name;

  //------------------------------------------------------------------

  require('./helpers/download')(Model, app);
  require('./helpers/fixParams')(Model, app);
  require('./helpers/getMediaPath')(Model, app);
  require('./helpers/images')(Model, app);
  require('./helpers/initOperation')(Model, app);
  require('./helpers/copyObject')(Model, app);
  require('./helpers/moveObject')(Model, app);
  require('./helpers/prepareFile')(Model, app);
  require('./helpers/updateFile')(Model, app);
  require('./helpers/prepareObject')(Model, app);
  require('./helpers/sendFile')(Model, app);
  require('./helpers/checkFolders')(Model, app);
  require('./helpers/uploadData')(Model, app);
  require('./helpers/uploadFile')(Model, app);
  require('./helpers/uploadFiles')(Model, app);
  require('./helpers/uploadLocalFile')(Model, app);

  require('./add')(Model, app);
  //require('./beforeSave')(Model, app);
  require('./deleteObject')(Model, app);
  require('./details')(Model, app);
  require('./list')(Model, app);
  require('./newFolder')(Model, app);
  require('./search')(Model, app);
  require('./updateFile')(Model, app);
  require('./search')(Model, app);
  require('./updateFile')(Model, app);
  require('./copyObject')(Model, app);
  require('./moveObject')(Model, app);
  require('./uploadFile')(Model, app);
  require('./uploadFiles')(Model, app);

};
