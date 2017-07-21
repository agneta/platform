/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/core/rules.js
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
var _ = require('lodash');

var yaml = require('js-yaml');

module.exports = function(locals) {

  var project = locals.project;
  var templates = {};

  var dataPathTheme = path.join(project.paths.baseTheme, 'rules.yml');
  var dataPath = path.join(project.paths.base, 'rules.yml');

  fs.ensureFileSync(dataPathTheme);
  var dataTheme = yaml.safeLoad(fs.readFileSync(dataPathTheme, 'utf8'));

  fs.ensureFileSync(dataPath);
  var data = yaml.safeLoad(fs.readFileSync(dataPath, 'utf8'));

  _.mergeWith(data, dataTheme, mergeFn);

  if (data) {

    for (var props of data) {

      if (props.templates) {

        for (var name of props.templates) {

          var template = templates[name] || {
            scripts: [],
            styles: []
          };
          _.mergeWith(template, props.data, mergeFn);
          templates[name] = template;
        }
      }
    }
  }


  function mergeFn(objValue, srcValue) {
    if (_.isArray(objValue) || _.isArray(srcValue)) {
      objValue = objValue || [];
      srcValue = srcValue || [];

      return _.uniq(srcValue.concat(objValue));
    }
  }

  function run(data) {

    data.styles = data.styles || [];
    data.scripts = data.scripts || [];

    /////////////////////////////////////

    if (data.path) {
      var parsedPath = path.parse(data.path);
      data.path_name = parsedPath.name;
    }

    /////////////////////////////////////

    var templateData = templates[data.templateSource || data.template];
    if (templateData) {
      _.mergeWith(data, templateData, mergeFn);
    }

    return data;

  }

  return {
    run: run
  };

};
