/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: main/server/sftp/session/writefile.js
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
const db = require('mime-db');
const mime = require('mime-type')(db);
const path = require('path');

//------------------------------------------------------------------------------------
// Upload file from Storage

module.exports = function(session, app) {

  session.on('writefile', function(location, readable_stream) {

    var parsed = path.parse(location);

    var contentType = mime.lookup(
      parsed.ext
    );

    location = session.helpers.location(location);

    //console.log('writefile:location',location);
    //console.log('writefile:type',type);
    //console.log('writefile:contentType',contentType);

    app.models.Media_Private.__sendFile({
      location: location,
      mimetype: contentType,
      stream: readable_stream
    })
      .then(function() {

      })
      .catch(function(error) {
        console.error(error);
      });
  });

};
