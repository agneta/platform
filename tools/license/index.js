/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: tools/license/index.js
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
const glob = require('glob');
const Promise = require('bluebird');
const path = require('path');
const fs = require('fs-extra');
const progress = require('progress');
const _ = require('lodash');

var template;

var copyrightStart = '/*   Copyright 2017 Agneta';
var copyrightEnd = ' */\n';

var pathSources = path.join(__dirname, '../..');

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
  .then(function(ignore) {
    ignore = [
      'bower_components/**',
      'node_modules/**',
      'theme/source/lib/**',
      '.git/**'
    ];

    return Promise.promisify(glob)('*.js', {
      cwd: pathSources,
      ignore: ignore,
      nodir: false,
      nosort: true,
      matchBase: true,
      stat: false
    });
  })
  .then(function(result) {

    var bar = new progress('[:bar] :percent', {
      total: result.length
    });

    return Promise.map(result, function(pathRelative) {

      let pathAbsolute = path.join(pathSources,pathRelative);

      return fs.readFile(pathAbsolute, {
        encoding: 'utf8'
      })
        .then(function(content) {

          var indexStart = content.indexOf(copyrightStart);
          if (indexStart === 0) {
            var indexEnd = content.indexOf(copyrightEnd);
            if (indexEnd < 0) {
              console.log('Could not find end of copyright:',pathRelative);
              return;
            }
            content = content.slice(indexEnd + copyrightEnd.length);
          }

          var header = template({
            path: pathRelative
          });

          content = header + content;

          fs.writeFile(pathAbsolute, content);
          bar.tick();
        });
    }, {
      concurrency: 1
    });
  });
