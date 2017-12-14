/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/boot/generate.js
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
var generator = require('loopback-sdk-angular');
var path = require('path');
var fs = require('fs-extra');

module.exports = function(app) {

  var options = app.get('options');
  var project = options.client.project;

  app.generate = {
    methods: function(options) {

      var script = generator.services(app, {});
      var token = app.get('token');

      options = options || {};

      var outputDir = options.outputDir || project.paths.app.generated;

      script = script.replace('$LoopBack$', `$${token.name}$`);

      var target = options.filename || 'services.js';
      var outputPath = path.join(outputDir, target);

      return fs.outputFile(outputPath, script);

    }
  };

};
