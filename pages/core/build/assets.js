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
const UglifyJS = require('uglify-js');
const micromatch = require('micromatch');
const ngAnnotate = require('ng-annotate');

const Promise = require('bluebird');
const fs = require('fs-extra');
const klaw = require('klaw');
const _ = require('lodash');
const StylusCompiler = require('../compiler/style');
const ScriptCompiler = require('../compiler/script');

module.exports = function(locals, options) {

  var logger = options.logger;
  var project = locals.project;

  var minifyJS;

  if (project.config.minify) {
    minifyJS = project.config.minify.js;
  }

  //----------------------------------------------------------

  logger.log('Copying Assets to public folder');

  var sources = [
    project.paths.sourceTheme,
    project.paths.source
  ];

  var bar;
  var sourcePaths = {};

  var scriptCompiler = ScriptCompiler(locals);
  var stylusCompiler = StylusCompiler(locals);

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

        return filter(sourcePath)
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

  function exportAsset(options) {
    options.container = 'public';
    return locals.exportFile.init(options);
  }

  function filter(options) {

    var relativeParsed = path.parse(options.relative);
    var outputPath = relativeParsed.dir;
    var outputFilePath = options.relative;
    var source_file_path = options.source;

    function copy() {

      return exportAsset({
        path: outputFilePath,
        sourcePath: source_file_path
      });
    }

    switch (relativeParsed.ext) {
      case '.js':

        var min_parsed = path.parse(relativeParsed.name);

        if (min_parsed.ext == '.min') {
          return copy();
        }

        var code = scriptCompiler.compile(source_file_path, {
          useBabel: true,
          babel: {
            comments: false
          }
        });

        if (minifyJS) {
          var exclude = false;
          if (minifyJS.exclude) {
            var match = micromatch([options.relative], minifyJS.exclude);
            if (match && match.length) {
              exclude = true;
            }
          }
          if (!exclude) {

            code = ngAnnotate(code, {
              add: true,
              remove: true
            });
            if (code.errors) {
              console.error(code.errors);
              throw new Error(code.errors);
            }
            code = code.src;
            code = UglifyJS.minify(code);

            if (code.error) {
              console.error(code.error);
              throw new Error('JS Error at file ['+source_file_path+'] '+code.error.message);
            }

            code = code.code;
          }
        }

        if (!code) {
          console.log(options);
          throw new Error('Code is missing for ', options.source);
        }

        return exportAsset({
          path: outputFilePath,
          data: code
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

        var str = fs.readFileSync(source_file_path, {
          encoding: 'utf8'
        });

        return exportCSS(
          stylusCompiler(str, source_file_path).render()
        );
      default:
        return copy();
    }

    function exportCSS(css) {

      var minified = new CleanCSS()
        .minify(css);
      var file_path = path.join(outputPath, relativeParsed.name + '.css');

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

    }

  }

};
