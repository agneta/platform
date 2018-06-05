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
module.exports = function(locals) {

  var project = locals.project;

  /////////////////////////////////////////////////////////////////
  //
  /////////////////////////////////////////////////////////////////

  function layoutResource(filePath, config) {

    filePath = filePath || this.page.template;
    var testFilePath = filePath + config.extOut;
    var stat = this.has_file(testFilePath);

    if (stat) {
      return filePath;
    }

  }

  /////////////////////////////////////////////////////////////////
  //
  /////////////////////////////////////////////////////////////////


  project.extend.helper.register('layout_style', function(filePath) {

    return layoutResource.call(this, filePath, {
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
