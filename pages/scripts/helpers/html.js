/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/scripts/helpers/html.js
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
module.exports = function(locals) {

  var project = locals.project;

  //////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////

  project.extend.helper.register('block_attr', function(x) {
    if (x == 0) {
      return '';
    }
    return 'hidden';
  });

  //////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////


  function attr(obj, key) {
    if (!obj[key]) {
      return '';
    }
    var val = obj[key];
    if (val === true) {
      return key;
    }
    return key + '="' + obj[key] + '"';
  }

  project.extend.helper.register('attr', attr);

  //////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////

  project.extend.helper.register('attrs', function(attrs) {
    var res = '';
    for (var key in attrs) {
      res += ' ' + attr(attrs, key);
    }
    return res;
  });


  //////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////

  project.extend.helper.register('_id', function(obj) {
    if (!obj.id) {
      return '';
    }

    return 'id="' + obj.id + '"';
  });

};
