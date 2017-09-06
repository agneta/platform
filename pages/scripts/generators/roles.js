/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/scripts/generators/roles.js
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
const path = require('path');
const Promise = require('bluebird');

module.exports = function(locals) {

  var project = locals.project;
  var services = locals.services;

  project.extend.generator.register('roles', function() {

    var roles = services.get('roles');
    var result = [];

    return Promise.map(_.keys(roles), function(key) {

      var role = roles[key];
      if (!role.form) {
        return;
      }

      var name = 'role-' + key;

      var pageData = _.extend({
        path: path.join('partial', name),
        template: 'role',
        isPartial: true,
        barebones: true,
        controller: 'FormRole',
        scripts:[
          'partial/role'
        ]
      }, role);

      pageData.form.name = 'formRole';

      result.push(pageData);
    })
      .then(function(){
        return result;
      });
  });

};
