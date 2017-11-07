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

  var project = locals.project;
  var helpers = locals.app.locals;

  return {
    run: function(page) {

      if (page.parent) {
        var parent = project.site.pages.findOne({
          parentName: page.parent
        });
        if (parent) {
          page.parentPath = parent.path;
        }
      }

      //-----------------------------------------

      function findBase(basePage) {

        basePage = helpers.get_page(basePage);

        if (basePage) {
          page.parentPath = basePage.path;
        }

      }

      var basePath = page.pathSource || page.path;

      while (!page.parentPath) {

        basePath = path.parse(basePath)
          .dir;

        if (!basePath) {
          break;
        }

        findBase(basePath);
      }


      //-----------------------------------------

      if (!page.parentPath) {
        page.parentPath = '/';
      }

      if (page.templateSource == 'home') {
        page.parentPath = null;
      }

      if (page.isPartial) {
        delete page.parentPath;
      }

    }
  };


};
