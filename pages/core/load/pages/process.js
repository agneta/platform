/*   Copyright 2017 Agneta Network Applications, LLC.
*
*   Source file: pages/core/load/pages.js
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
var pathFn = require('path');
var Promise = require('bluebird');

module.exports = function(locals) {
  var project = locals.project;

  var rules = require('./rules')(locals);
  var paths = require('./paths')(locals);

  locals.page.process = function(data) {
    var appName = locals.app.get('name');

    /* jshint validthis: true */
    var Page = project.site.pages;
    var path = locals.page.parseFilename(data.path);

    return Promise.resolve().then(function() {
      return Page.count({
        path: path,
        mtime: data.mtime
      }).then(function(count) {
        if (count) {
          //console.log('already up to date', data.path);
          return;
        }
        data.path = path;
        data.app = appName;

        if (data.if && !project.config[data.if]) {
          data.skip = true;
        }

        if (!data.title) {
          data.title = {
            en: pathFn.parse(data.path).name
          };
        }

        rules.run(data);

        return paths.run(data).then(function() {
          return Page.upsertWithWhere(
            {
              path: path,
              app: appName
            },
            data
          );
        });
      });
    });
  };
};
