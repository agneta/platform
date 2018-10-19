/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/pages/page.js
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
var _ = require('lodash');

function processor(locals) {
  var project = locals.project;
  var appName = locals.app.get('name');
  var rules = require('./generator/rules')(locals);
  var paths = require('./generator/paths')(locals);

  return function(data) {
    /* jshint validthis: true */
    var Page = project.site.pages;
    var path = parseFilename(data.path);

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
}

function getBase(page) {
  var data = _.extend({}, page, {
    templateSource: page.template,
    pathSource: page.path,
    barebones: true,
    path: null
  });

  delete data.isSource;
  delete data._id;
  delete data.source;

  return data;
}

function parseFilename(path) {
  path = path.substring(0, path.length - pathFn.extname(path).length);
  path = pathFn.normalize(path);
  if (path[0] != '/') {
    path = '/' + path;
  }
  return path;
}

module.exports = {
  parseFilename: parseFilename,
  processor: processor,
  view: function(page) {
    return _.extend(getBase(page), {
      isView: true,
      path: pathFn.join(page.path, 'view')
    });
  },
  viewData: function(page) {
    return _.extend(getBase(page), {
      isViewData: true,
      path: pathFn.join(page.path, 'view-data'),
      template: 'json/viewData'
    });
  },
  auth: function(page) {
    return _.extend(getBase(page), {
      isView: true,
      path: pathFn.join(page.path, 'view-auth'),
      template: 'authorization'
    });
  },
  authData: function(page) {
    return _.extend(getBase(page), {
      isViewData: true,
      path: pathFn.join(page.path, 'view-auth-data'),
      template: 'json/viewAuthData'
    });
  }
};
