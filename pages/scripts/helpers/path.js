/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/scripts/helpers/path.js
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
var path = require('path');
var url = require('url');
var _ = require('lodash');
var urljoin = require('url-join');
const querystring = require('querystring');

module.exports = function(locals) {
  var project = locals.project;
  var basePath = path.relative(
    project.paths.app.website,
    project.paths.app.source
  );

  //----------------------------------------------------------------------
  //

  function getPage(_path_request, options) {
    options = options || {};
    var page_path;
    return Promise.resolve()
      .then(function() {
        var path_request = _path_request;

        if (_path_request.path) {
          path_request = path_request.path;

          if (_path_request.query) {
            path_request += '?' + querystring.stringify(_path_request.query);
          }
        }

        if (!_.isString(path_request)) {
          return;
        }

        var parsed = url.parse(path_request);
        path_request = parsed.pathname || '/';

        var page_path_search = '/' + sourcePath(path_request);
        page_path = page_path_search;

        if (parsed.search) {
          page_path += parsed.search;
        }
        return project.site.pages.findOne({
          where: {
            path: page_path_search
          },
          fields: options.fields
        });
      })
      .then(function(data) {
        return {
          path: page_path,
          data: data
        };
      });
  }

  project.getPage = getPage;

  //.......................................................

  project.extend.helper.register('get_page', function(path_request, options) {
    return getPage(path_request, options).then(function(result) {
      return result.data;
    });
  });

  //.......................................................

  project.extend.helper.register('has_path', function(path_request) {
    return getPage(path_request, {
      fields: {
        id: true
      }
    }).then(function(result) {
      return result.data ? true : false;
    });
  });

  //----------------------------------------------------------------------

  function sourcePath(path_request) {
    if (path_request.path) {
      path_request = path_request.path;
    }

    path_request = clean_path(path_request);
    var tmp = path_request.split('/');

    if (_.get(project, 'site.languages.' + tmp[0])) {
      tmp.shift();
    }

    return tmp.join('/');
  }

  project.extend.helper.register('sourcePath', sourcePath);

  //----------------------------------------------------------------------

  project.extend.helper.register('full_path', function(path_request) {
    //console.log(project.site.url_web, path_request);
    return urljoin(project.site.url_web, path_request);
  });

  //----------------------------------------------------------------------

  project.extend.helper.register('get_path', function(path_request) {
    var self = this;
    return Promise.resolve()
      .then(function() {
        path_request = path_request || self.page;
        return getPage(path_request, { fields: { id: true } });
      })
      .then(function(res) {
        if (!res.data) {
          throw new Error('No page found with such path: ' + path_request);
        }

        //////////////////////////////////////////////////////////
        // RETURN THE CORRECT PATH
        //////////////////////////////////////////////////////////

        var lang_short = project.site.lang;

        if (!lang_short) {
          throw new Error('Could not get the correct lang short');
        }

        res = urljoin(lang_short, res.path);
        res = self.url_for(res);

        return res;
      });
  });

  //----------------------------------------------------------------------

  project.extend.helper.register('path_relative', function(path_request) {
    var self = this;
    return self.get_path(path_request).then(function(result) {
      result = self.clean_path(result);
      if (project.config.root && result.indexOf(project.config.root) === 0) {
        result = result.substring(project.config.root.length + 1);
      }
      return '/' + result;
    });
  });

  //----------------------------------------------------------------------

  project.extend.helper.register('has_file', function(pathFile) {
    pathFile = path.join('source', pathFile);

    var pathParsed = path.parse(pathFile);
    var sourceFile = project.theme.getFile(pathFile);

    if (!sourceFile) {
      switch (pathParsed.ext) {
        case '.css':
          pathParsed.base = pathParsed.name + '.styl';
          pathFile = path.format(pathParsed);
          break;
        default:
          return false;
      }
      sourceFile = project.theme.getFile(pathFile);
    }

    return sourceFile ? true : false;
  });

  ///////////////////////////////////////////////////////////////
  // Get yaml source file
  ///////////////////////////////////////////////////////////////

  project.extend.helper.register('get_source', function(data) {
    var result = this.get_asset(data);
    result = this.clean_path(result);
    result = path.join(basePath, result) + '.yml';

    return result;
  });

  ///////////////////////////////////////////////////////////////

  function clean_path(string) {
    var arr = string.split('/');
    var _arr = [];
    for (var elm of arr) {
      if (elm) {
        _arr.push(elm);
      }
    }
    return _arr.join('/');
  }

  project.extend.helper.register('clean_path', clean_path);

  ///////////////////////////////////////////////////////////////

  project.extend.helper.register('pagePath', function(page) {
    return page.pathSource || page.path;
  });
};
