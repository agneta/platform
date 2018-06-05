/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: main/server/sftp/session/rename.js
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

  session.on('rename', function(location, newLocation, callback) {

    location = session.helpers.location(location);
    newLocation = session.helpers.location(newLocation);
    newLocation = path.parse(newLocation);

    console.log('sftp:rename:location',location);
    console.log('sftp:rename:newLocation',newLocation);

    app.models.Media_Private.__updateFile({
      location: location,
      dir: newLocation.dir,
      name: newLocation.name
    })
      .then(function() {

        callback.ok();

      })
      .catch(function(err) {

        console.log(err);
        callback.fail();

      });

  });


};
