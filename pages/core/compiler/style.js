/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/core/compiler/style.js
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
var _ = require('lodash');
var stylus = require('stylus');
var nib = require('nib');
var path = require('path');
var fs = require('fs-extra');
var color = require('color');

module.exports = function(locals) {

  return function(str, pathFile) {

    var project = locals.project;
    var compiler = stylus(str)
      .set('filename', pathFile)
      .set('include css', true)
      .use(nib())
      .import('nib')
      .import(path.join(project.paths.baseTheme, 'variables.styl'));

    var pathProjectVariables = path.join(project.paths.source, '_variables.styl');

    if (fs.existsSync(pathProjectVariables)) {
      compiler.import(pathProjectVariables);
    }

    for (var prop in project.config.colors) {
      var value = project.config.colors[prop];

      var rgb = color(value).rgb();

      compiler.define('color-' + prop, new stylus.nodes.RGBA(
        rgb.color[0],
        rgb.color[1],
        rgb.color[2],
        rgb.valpha
      ));
    }

    compiler.define('asset', function(params) {
      var res = locals.app.locals.get_asset(params.val);
      return new stylus.nodes.String(res);
    });

    compiler.define('media', function(params) {
      var obj;
      try {
        obj = JSON.parse(params.val);
      } catch (err) {
        obj = null;
      }
      var res;
      if (obj) {
        res = locals.app.locals.get_media(obj.path, obj.size);
      } else {
        res = locals.app.locals.get_media(params.val);
      }
      return new stylus.nodes.String(res);
    });

    compiler.define('theme', function(params) {
      var themePath = path.join(project.paths.sourceTheme, params.val);
      return new stylus.nodes.String(themePath);
    });

    compiler.define('config', function(params) {
      return getValue(project.config, params);
    });

    compiler.define('site', function(params) {
      return getValue(project.site, params);
    });

    compiler.define('data', function(params) {

      var color = locals.app.locals.get_data(params.val);
      return new stylus.nodes.Literal(color);

    });

    function getValue(obj, params) {
      var res = _.get(obj, params.val);

      return valueType(res);
    }

    function valueType(res) {
      if (_.isString(res)) {
        return new stylus.nodes.String(res);
      }
      if (_.isBoolean(res)) {
        return new stylus.nodes.Boolean(res);
      }

      return new stylus.nodes.Boolean(false);
    }

    return compiler;
  };
};
