/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/core/build/pages.js
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
const _ = require('lodash');
const Promise = require('bluebird');
const path = require('path');
const Minimize = require('minimize');
const htmlclean = require('htmlclean');
const zlib = require('zlib');

const gzip = Promise.promisify(zlib.gzip);

module.exports = function(locals, options) {
  var logger = options.logger;
  var app = locals.app;
  var project = locals.project;

  var minimize = new Minimize({
    empty: true,
    cdata: true,
    comments: false,
    ssi: true,
    conditionals: false,
    spare: true,
    quotes: true,
    loose: false,
    dom: {
      xmlMode: true,
      lowerCaseAttributeNames: false,
      lowerCaseTags: false
    }
  });

  ///////////////////////////////////////////////////////

  project.site._build = true;

  return Promise.each(project.config.languages, function(language) {
    if (language.skipBuild) {
      return;
    }

    var lang = language.key;

    project.site.lang = lang;
    project.call_listeners('ready');

    logger.log(
      'Building on Language: ' + language.value + '(' + project.site.lang + ')'
    );

    ///////////////////////////////////////////////////////
    // Prepare paths to Generate
    ///////////////////////////////////////////////////////

    var generate_data = [];
    var pages_skipped = [];
    var pages_no_lang = [];

    return project.site.pages
      .map(function(data) {
        ///////////////////////////////////////////////////////
        // FILTER UNWANTED PAGES
        ///////////////////////////////////////////////////////

        if (!data.barebones) {
          if (!app.locals.has_lang(data)) {
            pages_no_lang.push(data.path);
            return;
          }
        }

        if (data.skip) {
          pages_skipped.push(data.path);
          return;
        }

        if (data.if && !project.config[data.if]) {
          pages_skipped.push(data.path);
          return;
        }

        generate_data.push(data);
      })
      .then(function() {
        //--------------------------------------------------
        // Add root page

        var indexPage = project.site.pages.findOne({
          path: '/'
        });
        generate_data.push(
          _.extend({}, indexPage, {
            _rootPath: true
          })
        );

        //----------------------------------------------------
        // Display Statistics before building

        logger.log('No Language on ' + pages_no_lang.length + ' pages');
        logger.log('Skipped ' + pages_skipped.length + ' pages');
        logger.log('Generating ' + generate_data.length + ' paths:');

        var bar = options.progress(generate_data.length, {
          title: 'Pages'
        });

        return Promise.resolve()
          .delay(20)
          .then(function() {
            return Promise.map(
              generate_data,
              function(data) {
                //-----------------------------------------------
                // GENERATE HTML

                bar.tick({
                  title: data.path
                });

                return locals.page
                  .renderData(data)
                  .then(function(html_rendered) {
                    //-----------------------------------------------
                    // MINIFY HTML

                    if (project.config.minify && project.config.minify.html) {
                      minimize.parse(html_rendered, function(
                        error,
                        html_minified
                      ) {
                        html_minified = htmlclean(html_minified);
                        return outputHtml(html_minified);
                      });
                    } else {
                      return outputHtml(html_rendered);
                    }
                  });

                function outputHtml(html) {
                  var data_path = data.path;

                  //-------------------------------

                  var outputPath;
                  var path_parsed = path.parse(data_path);

                  switch (path_parsed.ext) {
                    case '':
                      outputPath = path.join(data_path, 'index.html');
                      break;
                    default:
                      outputPath = path.join(path_parsed.dir, path_parsed.base);
                      break;
                  }

                  if (!data._rootPath) {
                    outputPath = path.join(lang, outputPath);
                  }

                  if (outputPath[0] == '/') {
                    outputPath = outputPath.substring(1);
                  }

                  //----------------------------------

                  var container;

                  if (data.isView || data.isViewData) {
                    container = 'private';
                  } else {
                    container = 'public';
                  }

                  //----------------------------------
                  // gzip

                  return gzip(Buffer.from(html)).then(function(html) {
                    return locals.exportFile({
                      container: container,
                      path: outputPath,
                      data: html
                    });
                  });
                }
              },
              {
                concurrency: 3
              }
            );
          });
      });
  });
};
