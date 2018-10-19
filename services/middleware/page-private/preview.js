/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/middleware/page-private/preview.js
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
module.exports = function(app) {
  var client = app.client;
  var project = client.project;
  var clientHelpers = client.app.locals;

  return function(data) {
    return Promise.resolve().then(function() {
      project.site.lang = data.lang;

      var pageType = client.page.type[data.type];
      if (!pageType) {
        return data.next();
      }

      return clientHelpers
        .get_page(data.remotePath)
        .then(function(page) {
          page = pageType(page);

          return client.page.renderData(page);
        })
        .then(function(content) {
          if (content) {
            data.res.send(content);
          }
        });
    });
  };
};
