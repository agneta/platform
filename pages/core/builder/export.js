/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/core/build/export.js
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
var fs = require('fs-extra');
var path = require('path');

module.exports = function(locals) {

  function init(options) {

    var filePath = path.join(options.container, options.path);
    var outputFilePath = path.join(locals.build_dir, filePath);

    if (options.data) {
      return fs.outputFile(
        outputFilePath,
        options.data);
    }

    if (options.sourcePath) {
      return fs.copy(options.sourcePath, outputFilePath);
    }

  }

  locals.exportFile = init;
};
