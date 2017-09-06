/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/server/remotes/media/helpers/checkFolders.js
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
const Promise = require('bluebird');

module.exports = function(Model) {

  Model.__checkFolders = function(options) {
    if(!options.dir){
      return Promise.resolve();
    }
    var dirParts = options.dir.split('/');
    var dir = '';
    return Promise.each(dirParts, function(name) {
      return Model.newFolder(name, dir)
        .catch(function(err){
          if(err.statusCode==400){
            return;
          }
          return Promise.reject(err);
        })
        .then(function() {
          if (dir.length) {
            dir += '/';
          }
          dir += name;
        });
    });
  };

};
