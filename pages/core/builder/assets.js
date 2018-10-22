/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/core/build/assets.js
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
const CleanCSS = require('clean-css');
const micromatch = require('micromatch');

const Promise = require('bluebird');
const fs = require('fs-extra');
const klaw = require('klaw');
const _ = require('lodash');

module.exports = function(locals, options) {

  var logger = options.logger;
  var project = locals.project;

  //----------------------------------------------------------

  logger.log('Copying Assets to public folder');

  var sources = [
    project.paths.app.frontend.source,
    project.paths.app.source
  ];

  var bar;
  var sourcePaths = {};

  return Promise.each(sources, function(sourceDir) {

    var walker = klaw(sourceDir);

    ////////////////////////////////////////////////////////
    // LOAD PROCESS PROJECT DATA - SETUP
    ////////////////////////////////////////////////////////

    walker.on('data', function(item) {

      var key = path.relative(sourceDir, item.path);
      var parts = key.split(path.sep);

      // Ignore Dirs or files starting with _

      for (var part of parts) {
        if (part[0] == '_') {
          return;
        }
      }

      if (item.stats.isDirectory()) {
        return;
      }

      var path_parsed = path.parse(item.path);

      switch (path_parsed.ext) {
        case '.yml':
        case '.ejs':
          return;
      }

      sourcePaths[key] = {
        source: item.path,
        relative: key
      };

    });

    return new Promise(function(resolve, reject) {
      walker.on('end', resolve);
      walker.on('error', reject);
    });
  })
    .then(function() {

      sourcePaths = _.values(sourcePaths);

      bar = options.progress(sourcePaths.length, {
        title: 'Assets'
      });

      return Promise.map(sourcePaths, function(sourcePath) {
        return Promise.resolve()
          .then(function() {
            return filter(sourcePath);
          })
          .then(function() {
            bar.tick({
              title: sourcePath.relative
            });
          });

      }, {
        concurrency: 3
      });
    })
    .then(function() {

      logger.success('Finished Syncing Assets');

    });

  function checkOutputPath(outputPath) {
    var pathParsed = path.parse(outputPath);
    switch(pathParsed.ext){
      case '.css':
      case '.js':
        if(pathParsed.base.indexOf('index.')===0){
          return pathParsed.dir + pathParsed.base.substring(5);
        }
        break;
    }
    return outputPath;
  }
  function exportAsset(options) {
    options.container = 'public';
    options.path = checkOutputPath(options.path);
    return locals.exportFile(options);
  }

  function filter(options) {

    let relativeParsed = path.parse(options.relative);
    let outputPath = relativeParsed.dir;
    let outputFilePath = options.relative;
    let source_file_path = options.source;
    let nameParsed = path.parse(relativeParsed.name);

    function copy() {

      return exportAsset({
        path: outputFilePath,
        sourcePath: source_file_path
      });
    }

    if (options.relative.indexOf('lib/') == 0) {
      return copy();
    }

    switch (relativeParsed.ext) {
      case '.js':

        if (nameParsed.ext == '.min') {
          return copy();
        }

        if (nameParsed.ext == '.module') {
          return;
        }

        var minifyJS = project.config.minify.js;
        if (minifyJS) {
          var match = micromatch([options.relative], minifyJS.exclude);
          if (match && match.length) {
            minifyJS = false;
          }
        }


        return project
          .compiler
          .script
          .compile(options.relative, {
            minify: minifyJS,
            onOutputPath: function(output){
              var outputPath = path.join(
                output.path,
                output.filename
              );
              outputPath = checkOutputPath(outputPath);
              var outputParsed = path.parse(outputPath);
              return {
                path: outputParsed.dir,
                filename: outputParsed.base
              };
            },
            output: path.join(locals.build_dir, 'public')
          })
          .catch(function(err) {
            if (err.skip) {
              return copy();
            }
          });

      case '.css':

        /////////////////////////////////////////////////
        // MINIFY STYLES - CSS
        /////////////////////////////////////////////////

        if (!(project.config.minify && project.config.minify.css)) {
          return copy();
        }

        return exportCSS(
          fs.readFileSync(source_file_path, {
            encoding: 'utf8'
          })
        );
      case '.styl':

        if (nameParsed.ext == '.module') {
          return;
        }

        return exportCSS(
          project
            .compiler
            .style
            .compile(source_file_path)
        );
      default:
        return copy();
    }

    function exportCSS(css) {

      return Promise.resolve()
        .then(function() {
          return new CleanCSS()
            .minify(css);
        })
        .catch(function(err){
          logger.error(`An issue occured with file: ${source_file_path}`);
          return Promise.reject(err);
        })
        .then(function(minified) {

          let file_path = path.join(outputPath, relativeParsed.name + '.css');

          if (minified.errors.length) {
            logger.error(minified.errors);
            throw 'CSS Minify Error';
          }

          if (!minified.styles) {
            throw new Error('Style has no content: ' + file_path);
          }

          return exportAsset({
            path: file_path,
            data: minified.styles
          });
        });


    }

  }

};
