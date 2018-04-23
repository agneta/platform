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
var _ = require('lodash');

module.exports = function(locals) {

  var project = locals.project;

  //--------------------------------------------------

  var filePaths = [
    project.paths.app.website
  ];

  for(var name in project.paths.app.extensions){
    var extPaths = project.paths.app.extensions[name];
    filePaths.push(extPaths.website);
  }
  if(locals.web){
    filePaths.push(locals.web.project.paths.appPortal.website);
  }

  filePaths.push(project.paths.common.website);
  filePaths.push(project.paths.theme.base);
  //--------------------------------------------------

  project.theme = {
    dirs: filePaths,
    readDir: function(base) {

      var dirs = filePaths.map(function(dir){
        return path.join(dir,base);
      });

      var files = {};

      for (var dir of dirs) {

        var stats = null;

        try {
          stats = fs.statSync(dir);
        } catch (e) {
          stats = null;
        }

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

      var result = getObject(getPath, 'isFile');

      if (!result) {
        var parsedPath = path.parse(getPath);
        getPath = path.join(
          parsedPath.dir,
          parsedPath.name,
          `index${parsedPath.ext}`);
        result = getObject(getPath,'isFile');
      }

      return result;
    },
    getDir: function(getPath) {
      return getObject(getPath, 'isDirectory');
    },
    getSourcePath: function(getFile) {
      for (var _filePath of filePaths) {
        if(getFile.indexOf(_filePath)===0){
          return path.relative(
            path.join(_filePath,'source'),
            getFile);
        }
      }
    },
    getSourceFile: function(getFile) {
      var result = project.theme.getFile(getFile);
      if (result) {
        return result;
      }
      return project.theme.getFile(path.join('source', getFile));
    },
    readSourceDir: function(dir) {
      var result = project.theme.readDir(dir);
      if (result) {
        return result;
      }
      return project.theme.readDir(path.join('source', dir));
    }
  };

  function getObject(getPath, method) {

    var filePath;

    for (var _filePath of filePaths) {

      filePath = path.join(_filePath, getPath);
      var stats;

      try {
        stats = fs.lstatSync(filePath);
      } catch (e) {
        stats = null;
      }

      if (stats && stats[method]()) {

        return filePath;

      }
    }

    return false;

  }
};
