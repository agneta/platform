/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/scripts/utilities.js
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
var yaml = require('js-yaml');
var fs = require('fs-extra');
var path = require('path');
var _ = require('lodash');

module.exports = function(locals) {

  var project = locals.project;
  var utilities = {};

  var baseDirs = [{
    builtin: false,
    dir: path.join(project.paths.project, 'utilities'),
  }, {
    builtin: true,
    dir: path.join(project.paths.portalWebsite, 'utilities')
  }];

  baseDirs.forEach(function(options) {

    var baseDir = options.dir;
    if (!fs.existsSync(baseDir)) {
      return;
    }
    var dirs = fs.readdirSync(baseDir);

    dirs.forEach(function(dir) {

      var utilPath = path.join(baseDir, dir);
      var stats = fs.statSync(utilPath);

      if (!stats.isDirectory()) {
        return;
      }

      var configPath = path.join(utilPath, 'config.yml');
      if (!fs.existsSync(configPath)) {
        return;
      }
      var config = yaml.safeLoad(fs.readFileSync(configPath,
        'utf8'
      ));

      utilities[dir] = {
        name: dir,
        path: utilPath,
        builtin: options.builtin,
        runner: require(utilPath),
        config: config
      };
    });
  });

  project.utilities = utilities;

  var utilPages = [];

  _.values(utilities)
    .forEach(function(utility) {

      var pageData = _.extend({
        name: utility.name,
        builtin: utility.builtin,
        path: 'utilities/' + utility.name,
        template: 'utility',
        viewData: {
          name: utility.name
        }
      }, utility.config);

      utilPages.push(pageData);

    });

  project.site.utilities = utilPages;

  project.extend.generator.register('utilities', function(locals) {
    return utilPages;
  });

};
