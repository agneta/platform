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

module.exports = function(locals) {
  var pageProcessor = require('./page').processor(locals);
  var project = locals.project;

  var rules = require('./generator/rules')(locals);
  var paths = require('./generator/paths')(locals);
  var templates = require('./generator/templates')(locals);

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
                    return pageProcessor.call(project, page);
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
        return rules.run(page).then(function() {
          templates(page);
          return page.save();
        });
      });
    })
    .then(function() {
      return project.site.pages.map(function(page) {
        paths.run(page);
        return page.save();
      });
    });
};
