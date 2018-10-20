/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/core/generators.js
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
var Promise = require('bluebird');
var fs = require('fs-extra');
var path = require('path');
const yaml = require('js-yaml');

module.exports = function(locals) {
  var project = locals.project;

  locals.page.generate = function() {
    return Promise.resolve().then(function() {
      project.call_listeners('generateBefore');

      var generators = project.extend.generator.list();
      var arr = Object.keys(generators);

      return Promise.map(
        arr,
        function(key) {
          var generator = generators[key];

          return generator.apply(project, [locals, onPage]);
        },
        {
          concurrency: 1
        }
      );

      function onPage(data) {
        data.generated = true;

        var content = yaml.safeDump(data);
        var outputPath =
          path.join(project.paths.app.source, data.path) + '.yml';

        return fs.outputFile(outputPath, content);
      }
    });
  };
};
