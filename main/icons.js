/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: main/icons.js
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
var path = require('path');
var fs = require('fs-extra');
var ProgressBar = require('progress');
var Promise = require('bluebird');
var promiseCopy = Promise.promisify(fs.copy);
var chalk = require('chalk');
var glob = Promise.promisify(require('glob'));
var lstat = Promise.promisify(fs.lstat);

module.exports = function(paths) {

  var icons = {};
  var searchTarget = 'node_modules/material-design-icons';

  var searchDir = path.join(paths.core.project, searchTarget);

  try{
    fs.statSync(searchDir);
  }catch(e){
    searchDir = path.join(paths.theme.base, searchTarget);
  }


  console.log();
  console.log('-----------------------------------');
  console.log(chalk.blue('Searching for Icons...'));

  return Promise.promisify(fs.readdir)(searchDir)
    .then(function(files) {

      var result = [];

      return Promise.map(files, function(file) {

        var base = path.join(file, 'svg', 'production');
        var svgDir = path.join(searchDir, base);

        return lstat(svgDir)
          .then(function() {
            return glob('**/*_24px.svg', {
              cwd: svgDir,
              nodir: true,
              nosort: true,
              stat: false
            });
          })
          .then(function(found) {
            result.push({
              base: base,
              files: found
            });
          })
          .catch(function() {

          });
      })
        .then(function() {
          return result;
        });
    })
    .then(function(result) {

      var names = [];

      return Promise.map(result, function(dir) {
        return Promise.map(dir.files, function(file) {
          var parsed = path.parse(file);
          var name = parsed.name;
          name = name.split('_');
          name.pop();
          name.shift();
          name = name.join('_');

          icons[name] = path.join(dir.base, file);
          names.push(name);
        });
      })
        .then(function(){
          return names;
        });
    })
    .then(function(names) {

      var bar = new ProgressBar('[:bar] :percent', {
        total: names.length
      });

      return Promise.map(names, function(name) {
        var sourcePath = path.join(searchDir, icons[name]);
        var destPath = path.join(paths.theme.base, 'icons', name + '.svg');
        return promiseCopy(sourcePath, destPath)
          .then(function() {
            bar.tick();
          });
      }, {
        concurrency: 1
      });
    })
    .then(function() {
      console.log(chalk.green('Success: Icons are transfered'));
      console.log('-----------------------------------');
      console.log();
    });
};
