/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/utilities/sync/media/deleteUnused.js
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

  var foundObjects = options.foundObjects;
  var Media = options.Media;
  var util = options.util;
  var barDeleteUnused;

  return Media.count({
    type: {
      neq: 'folder'
    }
  }).then(function(totalFiles) {

    barDeleteUnused = util.progress(totalFiles, {
      title: 'Delete unused locations'
    });

    return deleteUnused();

  });

  function deleteUnused(skip) {

    skip = skip || 0;
    var length;

    return Media.find({
      where: {
        type: {
          neq: 'folder'
        }
      },
      fields: {
        id: true,
        location: true
      },
      limit: 200,
      skip: skip
    }).then(function(result) {

      length = result.length;
      barDeleteUnused.addLength(length);

      return Promise.map(result, function(obj) {

        var exists = foundObjects[obj.location];

        return Promise.resolve()
          .delay(20)
          .then(function() {

            if (exists) {
              return;
            }

            return obj.destroy()
              .then(function() {
                util.log('Deleted Missing Folder: ' + obj.location);
              });

          })
          .then(function() {
            barDeleteUnused.tick({
              title: obj.location
            });
          });
      }, {
        concurrency: 20
      });

    })
      .then(function() {
        if (length) {
          skip += length;
          return deleteUnused(skip);
        }

      });
  }
};
