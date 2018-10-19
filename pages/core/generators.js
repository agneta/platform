/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/core/generators.js
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
var Promise = require('bluebird');
var _ = require('lodash');
var nPath = require('path');
var pageProcessor = require('./page');

module.exports = function(locals) {
  var project = locals.project;

  var rules = require('./generator/rules')(locals);
  var paths = require('./generator/paths')(locals);
  var templates = require('./generator/templates')(locals);

  var excludeConfig = locals.load.pages && locals.load.pages.exclude;
  excludeConfig = excludeConfig || {};

  return Promise.resolve()
    .then(function() {
      project.call_listeners('generateBefore');

      var generators = project.extend.generator.list();
      var arr = Object.keys(generators);

      return Promise.map(
        arr,
        function(key) {
          var generator = generators[key];

          return generator.call(project, locals).then(function(pages) {
            return Promise.map(
              pages,
              function(page) {
                if (page.template_build && locals.buildOptions) {
                  page.template = page.template_build;
                }

                page.isSource = true;

                return Promise.resolve()
                  .then(function() {
                    if (
                      project.config.authorization &&
                      !page.skipAuthorization
                    ) {
                      if (!page.authorization) {
                        page.authorization = project.config.authorization;
                      }
                    }
                  })
                  .then(function() {
                    if (excludeConfig.pages || page.viewOnly) {
                      page.path = pageProcessor.parseFilename(page.path);
                      return generate(page);
                    }

                    return pageProcessor.process
                      .call(project, page)
                      .then(function(doc) {
                        if (!doc) {
                          return;
                        }
                        return generate(page);
                      });
                  });
              },
              {
                concurrency: 1
              }
            );
          });
        },
        {
          concurrency: 1
        }
      );
    })
    .then(function() {
      return project.site.pages.map(function(page) {
        rules.run(page);
        templates(page);
        return page;
      });
    })
    .then(function(pages) {
      return pages.map(
        function(page) {
          paths.run(page);
          return page.save();
        },
        {
          concurrency: 10
        }
      );
    });

  function generate(page) {
    if (!page.template) {
      console.error(page);
      throw new Error('Must have a template on: ' + page.path);
    }

    var pageBase = {
      templateSource: page.template,
      pathSource: page.path,
      barebones: true,
      path: null
    };

    return Promise.resolve()
      .then(function() {
        if (excludeConfig.view) {
          return;
        }

        return run(
          _.extend({}, page, pageBase, {
            isView: true,
            path: nPath.join(page.path, 'view')
          })
        );
      })
      .then(function() {
        if (excludeConfig.viewData) {
          return;
        }

        return run(
          _.extend({}, page, pageBase, {
            isViewData: true,
            path: nPath.join(page.path, 'view-data'),
            template: 'json/viewData'
          })
        );
      })
      .then(function() {
        if (excludeConfig.auth) {
          return;
        }

        if (page.authorization) {
          return run(
            _.extend({}, page, pageBase, {
              isView: true,
              path: nPath.join(page.path, 'view-auth'),
              template: 'authorization'
            })
          ).then(function() {
            return run(
              _.extend({}, page, pageBase, {
                isViewData: true,
                path: nPath.join(page.path, 'view-auth-data'),
                template: 'json/viewAuthData'
              })
            );
          });
        }
      });
  }

  function run(data) {
    delete data.isSource;
    delete data._id;
    delete data.source;

    var loadFields = locals.load.pages && locals.load.pages.fields;

    if (_.isObject(loadFields)) {
      for (var key in data) {
        if (!loadFields[key]) {
          delete data[key];
        }
      }
    }

    return pageProcessor.process.call(project, data);
  }
};
