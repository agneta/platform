/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/scripts/generators/pages.js
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
const klaw = require('klaw');

module.exports = function(locals) {
  var project = locals.project;

  locals.page.read = function() {
    var pageDirs = project.theme.dirs.map(function(pathDir) {
      return path.join(pathDir, 'source');
    });
    var readFile = require('./readFile')(locals);

    return Promise.map(
      pageDirs,
      function(dir) {
        var walker = klaw(dir);
        var items = [];

        walker.on('data', function(item) {
          var path_file_parsed = path.parse(item.path);

          if (item.stats.isDirectory()) {
            return;
          }

          if (path_file_parsed.ext != '.yml') {
            return;
          }

          if (path.parse(path_file_parsed.name).ext) {
            return;
          }
          items.push({
            path: item.path,
            mtime: item.stats.mtime
          });
        });

        return new Promise(function(resolve, reject) {
          walker.on('end', function() {
            resolve(items);
          });
          walker.on('error', reject);
        }).then(function(items) {
          return Promise.map(
            items,
            function(item) {
              //console.log('onItem:', item);

              return Promise.resolve()
                .then(function() {
                  return project.site.pages.count({
                    source: item.path,
                    mtime: item.mtime
                  });
                })
                .then(function(count) {
                  if (count) {
                    //console.log('cached!');
                    return;
                  }
                  return readFile({
                    item: item,
                    dir: dir
                  });
                });
            },
            {
              concurrency: 2
            }
          );
        });
      },
      {
        concurrency: 1
      }
    );
  };
};
