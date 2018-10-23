/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/core/generator/paths.js
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

module.exports = function(locals) {
  var helpers = locals.app.locals;

  return {
    run: function(page) {
      return Promise.resolve()
        .then(function() {
          if (!page.parent) {
            return;
          }
          return helpers.get_page(page.parent).then(function(parent) {
            if (parent) {
              page.parentPath = parent.path;
            }
          });
        })
        .then(function() {
          //-----------------------------------------

          var basePath = page.pathSource || page.path;

          function checkBase(basePath) {
            return Promise.resolve().then(function() {
              if (page.parentPath) {
                return;
              }
              basePath = path.parse(basePath).dir;

              if (!basePath || basePath == '/') {
                return;
              }

              return helpers.get_page(basePath).then(function(result) {
                if (result) {
                  page.parentPath = result.path;
                }

                return checkBase(basePath);
              });
            });
          }

          return checkBase(basePath).then(function() {
            //-----------------------------------------

            if (!page.parentPath) {
              page.parentPath = '/';
            }

            if (page.templateSource == 'home') {
              page.parentPath = null;
            }

            if (page.isDialog) {
              delete page.parentPath;
            }
          });
        });
    }
  };
};
