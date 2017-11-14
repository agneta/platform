/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: main/server/sftp/session/delete.js
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

  session.on('delete', remove);

  session.on('rmdir', remove);

  function remove(location, callback) {

    location = session.helpers.location(location);

    app.models.Media_Private.deleteObject(location)
      .then(function() {
        //console.log('sftp:session:delete', 'success');
        callback.ok();
      })
      .catch(function(err) {
        console.log(err);
        callback.fail();
      });


  }

};
