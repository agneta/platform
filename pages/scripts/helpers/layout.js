/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/scripts/helpers/layout.js
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

module.exports = function(locals) {

  var project = locals.project;

  /////////////////////////////////////////////////////////////////
  //
  /////////////////////////////////////////////////////////////////

  function layoutResource(options, config) {


    options = options || {};

    var _this = this;
    var template = options.template || this.page.template;
    var filePath = template + config.extOut;
    var stat = this.has_file(filePath);

    if (stat) {
      var resPath = _this.get_asset(filePath);
      if (options.source) {
        return resPath;
      }

      return _this[config.type](resPath);

    }else{
      //console.warn('Resource not found',filePath);
    }

  }

  /////////////////////////////////////////////////////////////////
  //
  /////////////////////////////////////////////////////////////////


  project.extend.helper.register('layout_style', function(options) {

    return layoutResource.call(this, options, {
      type: 'css',
      ext: '.styl',
      extOut: '.css'
    });

  });

  /////////////////////////////////////////////////////////////////
  //
  /////////////////////////////////////////////////////////////////

  project.extend.helper.register('layout_script', function(options) {

    return layoutResource.call(this, options, {
      type: 'js',
      ext: '.js',
      extOut: '.js'
    });

  });


};
