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

    project.config.angular_libs.push({
      dep: 'lbServices',
      js: 'generated/services'
    });

    switch(project.site.lang){
      case 'gr':
        project.site.locale = 'el-gr';
        break;
    }


    if (!project.site.building) {

      scripts.push({
        name: 'socketCluster',
        path: 'lib/socketcluster.min'
      });
      scripts.push('main/socket');
      scripts.push('main/portal');

    }

    bundle();
  });

  function bundle() {
    let scripts = [];
    return Promise.resolve()
      .then(function() {
        let content = '';

        scripts.push('lib/angular.min');

        for (var lib of project.config.angular_libs) {
          scripts.push(lib.js);
        }

        for (var script of project.config.scripts) {
          scripts.push(script);
        }

        scripts = scripts.map(function(script){
          if(_.isString(script)){
            return {
              path: script
            };
          }
          return script;
        });

        scripts = _.uniqBy(scripts,'path');

        scripts = scripts.map(function(script){

          var scriptPath = script.path || script;

          if(script.name){
            content += `window.${script.name}=`;
          }

          content += `require('${scriptPath}');\n`;
        });

        var outputPath = path.join(project.paths.app.source, 'main/bundle.js');
        return fs.outputFile(outputPath, content);

      });

  }


};
