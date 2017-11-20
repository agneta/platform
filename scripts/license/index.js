/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: scripts/license/index.js
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
const klaw = require('klaw');
const Promise = require('bluebird');
const path = require('path');
const fs = require('fs-extra');
const progress = require('progress');
const _ = require('lodash');

var sourcePaths = [];
var template;

var copyrightStart = '/*   Copyright 2017 Agneta';
var copyrightEnd = ' */\n';

Promise.resolve()
  .then(function() {

    return fs.readFile(path.join(__dirname, 'template.ejs'), {
      encoding: 'utf8'
    });

  })
  .then(function(content) {
    if (content.indexOf(copyrightStart) !== 0) {
      return Promise.reject(`Copyright must start with '${copyrightStart}'`);
    }
    if (content.indexOf(copyrightEnd) !== content.length - copyrightEnd.length) {
      return Promise.reject(`Copyright must end with '${copyrightEnd}'`);
    }
    template = _.template(content);

  })
  .then(function() {

    var pathSources = path.join(__dirname, '../..');
    var walker = klaw(pathSources);
    var exclude = [
      'node_modules',
      'bower_components',
      'theme/bower_components',
      'portal/bower_components'
    ];

    walker.on('data', function(item) {

      if (item.stats.isDirectory()) {
        return;
      }

      var path_parsed = path.parse(item.path);
      var path_rel = path.relative(pathSources, item.path);

      for (var excludeItem of exclude) {
        if (path_rel.indexOf(excludeItem) === 0) {
          return;
        }
      }

      switch (path_parsed.ext) {
        case '.js':
          console.log(path_rel);
          sourcePaths.push({
            absolute: item.path,
            relative: path_rel
          });
          break;
      }

    });

    return new Promise(function(resolve, reject) {
      walker.on('end', resolve);
      walker.on('error', reject);
    });

  })
  .then(function() {

    var bar = new progress('[:bar] :percent', {
      total: sourcePaths.length
    });

    return Promise.map(sourcePaths, function(sourcePath) {

      return fs.readFile(sourcePath.absolute, {
        encoding: 'utf8'
      })
        .then(function(content) {

          var indexStart = content.indexOf(copyrightStart);
          if (indexStart === 0) {
            var indexEnd = content.indexOf(copyrightEnd);
            if (indexEnd < 0) {
              return Promise.reject('Could not find end of copyright');
            }
            content = content.slice(indexEnd + copyrightEnd.length);
          }

          var header = template({
            path: sourcePath.relative
          });

          content = header + content;

          fs.writeFile(sourcePath.absolute, content);
          bar.tick();
        });
    }, {
      concurrency: 1
    });
  });
