/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/core/build/delete_old.js
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
const Promise = require('bluebird');
const fs = require('fs-extra');
const klaw = require('klaw');

module.exports = function(locals, options) {

  var logger = options.logger;
  var exportFile = locals.exportFile;
  var walker = klaw(locals.build_dir);
  var deletePaths = [];

  ////////////////////////////////////////////////////////
  // LOAD PROCESS PROJECT DATA - SETUP
  ////////////////////////////////////////////////////////

  walker.on('data', function(item) {

    var pathCheck = path.relative(locals.build_dir, item.path);

    if (!pathCheck.length) {
      return;
    }

    if (item.stats.isDirectory()) {
      return;
    }
    if (exportFile.dictFile[pathCheck]) {
      return;
    }

    deletePaths.push(item.path);

  });

  return new Promise(function(resolve, reject) {

    walker.on('end', function() {

      Promise.map(deletePaths, function(deletePath) {

        logger.log('Deleting path: ' + deletePath);
        return Promise.promisify(fs.remove)(deletePath);

      })
        .then(resolve);

    });

    walker.on('error', reject);

  });
};
