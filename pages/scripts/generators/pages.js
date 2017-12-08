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
const page = require('../../pages/page');
const path = require('path');
const _ = require('lodash');
const Promise = require('bluebird');
const File = require('../../pages/file');
const yaml = require('js-yaml');
const replaceExt = require('replace-ext');
const klaw = require('klaw');
const fs = require('fs-extra');

module.exports = function(locals) {

  var project = locals.project;

  project.extend.generator.register('pages', function() {

    var pageDirs = [
      project.paths.theme.source,
      project.paths.app.source
    ];

    var result = {};

    return Promise.resolve()
      .then(function() {
        return Promise.map(pageDirs, function(dir) {

          var walker = klaw(dir);
          var paths = [];

          walker.on('data', function(item) {
            var path_file_parsed = path.parse(item.path);

            if (item.stats.isDirectory()) {
              return;
            }

            if (path_file_parsed.ext != '.yml') {
              return;
            }

            paths.push(item.path);
          });

          return new Promise(function(resolve, reject) {
            walker.on('end', function() {
              resolve(paths);
            });
            walker.on('error', reject);
          })
            .then(function(files) {

              return Promise.map(files, function(path_file) {

                var filePath = path.relative(dir, path_file);
                var path_url = filePath.split(path.sep).join('/');

                if (pageExists(path_url)) {
                  return;
                }

                var file = new File({
                  source: path_file,
                  path: filePath,
                  type: 'create',
                  params: {
                    path: path_url
                  }
                });

                var data;

                return readFile(file)
                  .then(function(_data) {

                    data = _data;
                    data.path = data.path || path_url;

                    //---------------------------------------
                    // extend

                    if (data.extend) {

                      var extendPath = path.join(
                        project.paths.app.source,
                        data.extend
                      ) + '.yml';
                      return fs.readFile(extendPath)
                        .then(function(content) {

                          var extendedData = yaml.safeLoad(content) || {};
                          _.mergePages(extendedData, data);
                          data = extendedData;
                        });

                    }

                  })
                  .then(function() {

                    //---------------------------------------
                    // Dialogs

                    if (data.path.indexOf('dialog/') === 0) {
                      data.viewOnly = true;
                      data.isDialog = true;
                    }
                    
                    if (data.path.indexOf('partial/') === 0) {
                      data.viewOnly = true;
                      data.isPartial = true;
                    }

                    //---------------------------------------
                    // Search for template if not defined

                    if (!data.template) {

                      var templatePath = path.join(
                        'source',
                        replaceExt(data.path, '.ejs')
                      );

                      templatePath = project.theme.getFile(
                        templatePath
                      );

                      if (templatePath) {
                        templatePath = path.parse(data.path);
                        templatePath = path.join(
                          templatePath.dir,
                          templatePath.name);
                        data.template = templatePath;
                      }

                    }

                    //---------------------------------------


                    addPage(data);
                  });

              }, {
                concurrency: 10
              });
            });
        }, {
          concurrency: 1
        });
      })
      .then(function() {
        return _.values(result);
      });

    function pageExists(dataPath) {
      var pagePath = page.parseFilename(dataPath);
      return result[pagePath] ? true : false;
    }

    function addPage(data) {
      var pagePath = page.parseFilename(data.path);
      result[pagePath] = data;
    }


  });


  function readFile(file) {

    return Promise.all([
      file.stat(),
      file.read()
    ]).spread(function(stats, content) {
      var data;
      try {
        data = yaml.safeLoad(content);
      } catch (e) {
        console.error('Found problem on YAML: ' + file.path);
        throw e;
      }

      if (!data) {
        return {};
      }

      data.source = file.path;
      data.filename = path.parse(data.source).name;

      return data;
    });
  }

};
