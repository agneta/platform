/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/scripts/helpers/assets.js
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
var fs = require('fs');
var urljoin = require('url-join');

module.exports = function(locals) {

  var project = locals.project;

  project.extend.helper.register('asset_page', function(assetPath, page) {
    page = page || this.page;
    assetPath = urljoin(this.pagePath(page), assetPath);
    return this.get_asset(assetPath);
  });

  project.extend.helper.register('asset_files', function(path_target) {
    var path_dir = path.join(project.paths.source, path_target);
    return fs.readdirSync(path_dir);
  });

  project.extend.helper.register('asset_path', function(data) {
    return this.sourcePath(data);
  });

  project.extend.helper.register('get_asset', function(path_check) {

    if (_.isObject(path_check)) {
      if (path_check.services) {
        return urljoin(project.site.services.url, path_check.services);
      }
    }

    if(!_.isString(path_check)){
      console.log('get_asset:path_check',path_check);
      throw new Error('Could not process asset_path [NOT STRING]. Check the log above');
    }

    if (url.parse(path_check).protocol) {
      return path_check;
    }

    if (path_check.indexOf('//') === 0) {
      return project.site.protocol + path_check;
    }

    var tmp = this.sourcePath(path_check).split('/');

    if (tmp[0] == 'lib') {
      tmp.shift();
      return this.get_lib(tmp.join('/'));
    }

    var stat = this.has_file(path_check);
    if (!stat) {
      throw new Error('Asset does not exist: ' + path_check);
    }

    if (tmp[0] == 'views') {
      tmp.shift();
    }

    var result = tmp.join('/');

    result = this.getVersion(result);
    result = this.url_for(result);

    return result;
  });

};
