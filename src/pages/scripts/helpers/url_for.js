/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/scripts/helpers/url_for.js
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
var url = require('url');
var nPath = require('path');
var urljoin = require('url-join');
var _ = require('lodash');

module.exports = function(locals) {

  var project = locals.project;

  function urlForHelper(path, options) {

    path = path || '/';

    var config = this.config;
    var root = config.root;
    var data = url.parse(path);

    options = _.assign({
      relative: config.relative_link
    }, options);

    // Exit if this is an external path
    if (data.protocol || path.substring(0, 2) === '//') {
      return path;
    }

    // Resolve relative url
    if (options.relative) {
      return this.relative_url(this.path, path);
    }
    path = nPath.normalize('/' + urljoin(root, path));

    return path;
  }

  project.extend.helper.register('url_for', urlForHelper);

};
