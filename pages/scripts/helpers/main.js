/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/scripts/helpers/main.js
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
var fs = require('fs');
var path = require('path');
var urljoin = require('url-join');

module.exports = function(locals) {

  var project = locals.project;

  /////////////////////////////////////////////////////
  //
  /////////////////////////////////////////////////////

  project.extend.helper.register('get_name', function(page) {
    var arr = page.slug.split('/');
    return arr[arr.length - 1];
  });

  /////////////////////////////////////////////////////
  //
  /////////////////////////////////////////////////////


  project.extend.helper.register('url_join', urljoin);

  ////////////////////////////////////////////////
  // GET VALUE BASED ON LIVE OR PREVIEW
  ////////////////////////////////////////////////


  project.extend.helper.register('get_env',function(obj) {

    var res = obj[locals.env];

    if (!res) {
      console.error(
        'Could not find environment value',
        locals.env,
        'of',
        obj);

      throw new Error('Could not find environment value');
    }

    return res;
  });

  /////////////////////////////////////////////////////
  //
  /////////////////////////////////////////////////////

  project.extend.helper.register('isActive', function(item) {
    var a = item.pathSource || item.path || item;
    var b = this.page.pathSource || this.page.path;
    return a == b;
  });


  /////////////////////////////////////////////////////////////////
  //
  /////////////////////////////////////////////////////////////////

  project.extend.helper.register('has_source', function(target) {
    return this.is_file(path.join(project.paths.app.source, target));
  });

  project.extend.helper.register('is_file', function(path_check) {
    try {
      fs.statSync(path_check);
      return true;
    } catch (err) {
      return false;
    }
  });

};
