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
var _ = require('lodash');
var beautify_html = require('js-beautify').html;
var pathFn = require('path');
var Promise = require('bluebird');

module.exports = function(locals) {
  var commonData = {};
  var page = (locals.page = {});
  var project = locals.project;

  page.commonData = function(page) {
    var key = page.pathSource || page.path;
    var data = commonData[key] || (commonData[key] = {});
    _.defaults(data, {
      scripts: [],
      styles: []
    });
    return data;
  };

  page.renderData = function(data) {
    let helpers = locals.app.locals;
    let data_render = _.extend({
      page: data
    });

    return helpers.template('page', data_render).then(function(body) {
      data_render.body = body;
      return helpers.template('layout', data_render).then(function(content) {
        if (!data.barebones || data.isView) {
          content = beautify_html(content, {
            indent_size: 2,
            max_preserve_newlines: 0,
            wrap_attributes: 'force'
          });
        }

        return content;
      });
    });
  };

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

  page.parseFilename = function(path) {
    path = path.substring(0, path.length - pathFn.extname(path).length);
    path = pathFn.normalize(path);
    if (path[0] != '/') {
      path = '/' + path;
    }
    return path;
  };

  page.type = {
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

  return function() {
    commonData = {};

    var appName = locals.app.get('name');
    var rules = require('../generator/rules')(locals);
    var paths = require('../generator/paths')(locals);

    page.processor = function(data) {
      /* jshint validthis: true */
      var Page = project.site.pages;
      var path = page.parseFilename(data.path);

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

    return require('../generators')(locals)
      .catch(function(err) {
        console.log('Generator Error (check logs): ', err.message);
        console.error();
        return Promise.reject(err);
      })
      .then(function() {
        //console.log('Loaded all pages');
      });
  };
};
