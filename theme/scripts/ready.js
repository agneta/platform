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
var fs = require('fs');
var path = require('path');

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


  });

};
