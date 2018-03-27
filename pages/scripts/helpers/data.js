/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/scripts/helpers/data.js
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
var yaml = require('js-yaml');

module.exports = function(locals) {

  var project = locals.project;
  var commonData = {};

  project.extend.helper.register('commonData', function(page) {

    var key = page.pathSource || page.path;
    var data = commonData[key] || (commonData[key] = {});

    return data;
  });

  project.extend.helper.register('get_data', function(pathReq) {

    if (!pathReq) {
      throw new Error('The path is a required argument');
    }

    if (pathReq.indexOf('.') >= 0) {
      throw new Error('The path should not contain the character "."');
    }

    var objPath = pathReq.split('/').join('.');
    var cache = locals.cache.data;

    //------------------------------------------------------------
    // Check if requesting Directory
    var pathAbs = project.theme.getDir(
      path.join('data', pathReq)
    );

    if (
      pathAbs
    ) {
      var dir = getDir();
      if (dir) {
        //console.log('Got dir from cache', pathReq);
        return dir;
      }
      readDir();
      return getDir();
    }

    //------------------------------------------------------------
    // Check if requesting a file

    pathAbs = project.theme.getFile(
      path.join('data', pathReq + '.yml')
    );

    if (
      pathAbs
    ) {
      var file = getFile(pathAbs);
      if (file) {
        //console.log('Got file from cache', pathReq, cache.files.length);
        return file;
      }
      return loadFile(pathAbs, objPath);
    }

    console.warn('Could not find the request data: ' + pathReq);

    //-----------------------------------------------------------------------
    // Helper Functions

    function readDir() {

      var filePaths = project.theme.readDir(
        path.join('data', pathReq)
      );
      var cacheNames = [];

      for (var filePath of filePaths) {

        var cacheName = path.parse(filePath).name;
        var cachePath = objPath + '.' + cacheName;

        loadFile(filePath, cachePath);

        cacheNames.push(cacheName);
      }

      cache.dirs.set(objPath, cacheNames);

    }

    function getDir() {
      var cacheNames = cache.dirs.get(objPath);

      if (cacheNames) {

        var values = _.map(cacheNames, function(cacheName) {
          let fileObjPath = objPath + '.' + cacheName;
          var value = cache.files.get(fileObjPath);
          if (!value) {
            let pathAbs = project.theme.getFile(
              path.join('data', pathReq, cacheName) + '.yml'
            );
            value = loadFile(pathAbs,fileObjPath);
          }
          return value;
        });

        return _.zipObject(cacheNames, values);
      }
    }

    function getFile() {
      return cache.files.get(objPath);
    }

    function loadFile(filePath, cachePath) {

      var nameParsed = path.parse(filePath);
      var parser;

      switch (nameParsed.ext) {
        case '.yml':
          parser = yaml.safeLoad;
          break;
        default:
          return;
      }

      if (!parser) {
        throw new Error('Unrecognized data type: ' + filePath);
      }

      var data = fs.readFileSync(filePath, 'utf8');
      var size = data.length;
      data = parser(data);
      data.$size = size;

      cache.files.set(cachePath, data);
      return data;
    }

  });

  project.extend.helper.register('has_data', function(pathReq) {

    var result = project.theme.getDir(
      path.join('data', pathReq)
    );

    if (!result) {

      result = project.theme.getFile(
        path.join('data', pathReq + '.yml')
      );

    }

    return result ? true : false;

  });

  project.extend.helper.register('get_value', function(obj) {

    if (!obj) {
      return obj;
    }

    if (_.isObject(obj)) {
      var val = obj.__value;
      if (!_.isNull(val) && !_.isUndefined(val)) {
        return val;
      }
    }

    return obj;
  });

  project.extend.helper.register('get_values', function(data) {
    var self = this;
    data = this.get_value(data);
    function scan(obj) {
      for (var key in obj) {
        var value = self.get_value(obj[key]);
        if(_.isObject(value) || _.isArray(value)){
          value = scan(value);
        }
        obj[key] = value;
      }
      return obj;
    }
    return scan(data);
  });

};
