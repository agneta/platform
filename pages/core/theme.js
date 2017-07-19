/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/core/theme.js
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
var fs = require('fs');
var path = require('path');
var ejs = require('ejs');
var _ = require('lodash');

module.exports = function(locals) {

  var project = locals.project;

  project.theme = {

    readDir: function(base) {

      var dirs = [
        path.join(project.paths.baseTheme, base),
        path.join(project.paths.base, base)
      ];

      var files = {};

      for (var dir of dirs) {

        var stats = null;

        try {
          stats = fs.statSync(dir);
        } catch (e) {}

        if (stats && stats.isDirectory()) {

          var _files = fs.readdirSync(dir);

          for (var i in _files) {

            var _file = _files[i];
            files[_file] = path.join(dir, _file);
          }

        }
      }

      return _.values(files);
    },
    getFile: function(getPath) {
      return getObject(getPath, 'isFile');
    },
    getDir: function(getPath) {
      return getObject(getPath, 'isDirectory');
    },
    getTemplateFile: function(getFile) {
      var result = project.theme.getFile(getFile);
      if (result) {
        return result;
      }
      return project.theme.getFile(path.join('source', getFile));
    },
    readTemplateDir: function(dir) {
      var result = project.theme.readDir(dir);
      if (result) {
        return result;
      }
      return project.theme.readDir(path.join('source', dir));
    }
  };

  function getObject(getPath, method) {

    var filePaths = [
      path.join(project.paths.base, getPath),
      path.join(project.paths.baseTheme, getPath)
    ];
    var filePath;

    for (filePath of filePaths) {

      var stats;

      try {
        stats = fs.lstatSync(filePath);
      } catch (e) {}

      if (stats && stats[method]()) {

        return filePath;

      }
    }

    return false;

  }
};
