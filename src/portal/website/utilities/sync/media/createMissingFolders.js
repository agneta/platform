/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/utilities/sync/media/createMissingFolders.js
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
const _ = require('lodash');
const Promise = require('bluebird');

module.exports = function(options) {

  let foundFolders = options.foundFolders;
  let util = options.util;
  let Media = options.model;

  var foundFoldersArr = _.keys(foundFolders);

  var bar = util.progress(foundFoldersArr.length, {
    title: 'Create missing folders'
  });

  return Promise.map(foundFoldersArr, function(folderLocation) {

    return Media.findOrCreate({
      where: {
        location: folderLocation
      }
    }, {
      name: path.parse(folderLocation).name,
      location: folderLocation,
      type: 'folder'
    })
      .then(function(res) {

        bar.tick({
          title: folderLocation
        });

        if (res[1]) {
          util.log('Created Missing Folder: ' + folderLocation);
        }
      });

  }, {
    concurrency: 5
  });
};
