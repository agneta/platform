/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/boot/01-indexes.js
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

  var db;

  return new Promise(function(resolve, reject) {
    app.datasources.db.connector.connect(function(err, _db) {
      db = _db;
      if (err) {
        return reject(err);
      }
      resolve();
    });
  }).then(function() {

    return db.collection('Media').createIndex({
      location: 1
    }, {
      unique: true,
      name: 'location'
    });
  });


};
