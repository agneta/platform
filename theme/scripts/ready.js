/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: theme/scripts/ready.js
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

const _ = require('lodash');
const fs = require('fs-extra');
const path = require('path');

module.exports = function(locals) {

  var project = locals.project;

  project.on('ready', function() {

    var scripts = project.config.scripts;

    if (project.config.contact_form) {
      scripts.push('main/contact');
    }

    if (project.site.services) {

      scripts.push('main/interceptors');
      scripts.push('main/account');

      project.config.angular_libs.push({
        dep: 'lbServices',
        js: 'generated/services'
      });

      if (project.site.lang == 'gr') {
        scripts.push('main/greeklish');
      }

    } else {

      if (project.config.search) {
        console.warn('Search disabled because the API is not set');
      }

    }
    if (!project.site.building) {

      scripts.push('lib/socketcluster.min');
      scripts.push('main/socket');
      scripts.push('main/portal');

    }

    bundle();
  });

  function bundle() {

    return Promise.resolve()
      .then(function() {
        let content = '';

        concat('lib/angular.min');

        for (var lib of _.uniqBy(project.config.angular_libs, 'js')) {
          concat(lib.js);
        }

        for (var script of _.uniq(project.config.scripts)) {
          concat(script);
        }

        function concat(script) {
          var scriptPath = script.path || script;

          if(script.name){
            content += `window.${script.name}=`;
          }

          content += `require('${scriptPath}');\n`;
        }

        var outputPath = path.join(project.paths.app.source, 'main/bundle.js');
        return fs.outputFile(outputPath, content);

      });

  }


};
