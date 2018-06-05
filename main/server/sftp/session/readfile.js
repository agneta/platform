/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: main/server/sftp/session/readfile.js
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

module.exports = function(session, app) {

  session.on('readfile', function(location, writable_stream) {
    var req = {
      accessToken: {
      // For testing only
        userId: '58579794ccc7d91100d86bd3'
      }
    };

    location = session.helpers.location(location);

    app.models.Media_Private.__download(location, req)
      .then(function(item) {
        item.stream.pipe(writable_stream);
      })
      .catch(function(error) {
        console.error(error);
      });
  });


};
