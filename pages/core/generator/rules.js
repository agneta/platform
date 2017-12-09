/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/core/generator/rules.js
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

  var dataPathTheme = path.join(project.paths.theme.base, 'rules.yml');
  var dataPath = path.join(project.paths.app.website, 'rules.yml');

  fs.ensureFileSync(dataPathTheme);
  var dataTheme = yaml.safeLoad(fs.readFileSync(dataPathTheme, 'utf8'));

  fs.ensureFileSync(dataPath);
  var data = yaml.safeLoad(fs.readFileSync(dataPath, 'utf8'));

  _.mergePages(data, dataTheme);

  var dict = {
    templates:{},
    paths: {}
  };

  if (data) {

    for (var props of data) {

      addToDict('paths',props);
      addToDict('templates',props);
    }
  }

  function addToDict(dictName,props){

    var propData = props[dictName];

    if(!propData){
      return;
    }

    for (var name of propData) {

      var ruleData = dict[dictName][name] || {
        scripts: [],
        styles: []
      };
      _.mergePages(ruleData, props.data);
      dict[dictName][name] = ruleData;
    }

  }

  function getFromDict(data,dictName,property){

    var ruleData = dict[dictName];
    if(!ruleData){
      return;
    }
    var dictData = ruleData[property];
    if (dictData) {
      _.mergePages(data, dictData);
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

    getFromDict(data,'templates',data.templateSource || data.template);
    //console.log(data.path);
    getFromDict(data,'paths',data.pathSource || data.path);

    return data;

  }

  return {
    run: run
  };

};
