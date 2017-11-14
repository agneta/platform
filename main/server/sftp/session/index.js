/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: main/server/sftp/session/index.js
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

module.exports = function(session, app) {

  require('./helpers')(session, app);
  require('./rename')(session, app);
  require('./delete')(session, app);
  require('./readdir')(session, app);
  require('./mkdir')(session, app);
  require('./writefile')(session, app);
  require('./readfile')(session, app);

  session.on('stat', function(location, statkind, res) {

    location = session.helpers.location(location);

    app.models.Media_Private.details(null, location)
      .then(function(item) {
        console.log(item);

        switch(item.type){
          case 'folder':
            res.is_directory();
            break;
          default:
            res.is_file();
            break;
        }

        res.permissions = 0o755;
        res.uid = 'user';
        res.gid = 'group';
        res.size =item.sizeBytes;
        res.atime = item.createdAt;
        res.mtime = item.updatedAt;

        res.file();

      })
      .catch(console.error);

    //res.nofile();
  });

  //------------------------------------------------------------------------------------

  session.on('realpath', function(location, callback) {
    callback(
      path.join('/', location)
    );
  });

};
