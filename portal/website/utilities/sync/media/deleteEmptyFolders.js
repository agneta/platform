/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/utilities/sync/media/deleteEmptyFolders.js
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

module.exports = function(options){

  var Media = options.Media;
  var util = options.util;
  var barDeleteFolders;

  return Media.count({
    type: 'folder'
  }).then(function(totalFolders) {
    barDeleteFolders = util.progress(totalFolders, {
      title: 'Delete empty folders'
    });
    return deleteEmptyFolders();
  });

  function deleteEmptyFolders(skip) {

    skip = skip || 0;
    var length;

    return Media.find({
      where: {
        type: 'folder'
      },
      fields: {
        id: true,
        location: true
      },
      limit: 30,
      skip: skip
    }).then(function(result) {

      length = result.length;
      barDeleteFolders.addLength(length);

      return Promise.map(result, function(obj) {

        return Promise.resolve()
          .delay(40)
          .then(function() {

            return Media._list(obj.location, 1);

          })
          .then(function(result) {
            if (!result.count) {
              return obj.destroy()
                .then(function() {
                  util.log('Deleted Empty Folder: ' + obj.location);
                });
            }
          })
          .then(function() {
            barDeleteFolders.tick({
              title: obj.location
            });
          });
      }, {
        concurrency: 5
      });

    })
      .then(function() {
        if (length) {
          skip += length;
          return deleteEmptyFolders(skip);
        }

      });

  }

};
