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
const _ = require('lodash');
const stylus = require('stylus');
const nib = require('nib');
const path = require('path');
const fs = require('fs-extra');
const color = require('color');
const Promise = require('bluebird');

module.exports = function(locals) {

  var project = locals.project;

  function getCompiler(str, pathFile) {

    var compiler = stylus(str)
      .set('filename', pathFile)
      .set('include css', true)
      .use(nib())
      .import('nib')
      .import(path.join(project.paths.theme.base, 'variables.styl'));

    var pathProjectVariables = path.join(project.paths.app.source, '_variables.styl');

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
      var themePath = path.join(project.paths.theme.source, params.val);
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

  }


  //----------------------------------------

  function compile(source_file_path){

    var str = fs.readFileSync(source_file_path, {
      encoding: 'utf8'
    });

    return getCompiler(str, source_file_path).render();

  }

  function middleware(req,res,next){

    Promise.resolve()
      .then(function() {

        var parsedPath = path.parse(req.path);

        if (parsedPath.ext!='.css') {
          return;
        }

        parsedPath.ext = '.styl';
        delete parsedPath.base;

        let pathRelative = path.format(parsedPath);
        let pathSource = project.theme.getFile(path.join('source', pathRelative));

        if(!pathSource){
          return;
        }

        return fs.readFile(pathSource, {
          encoding: 'utf8'
        })
          .then(function(content){
            content = getCompiler(content, pathSource).render();
            let pathOutput = path.join(
              project.paths.app.cache,
              req.path
            );
            return fs.outputFile(pathOutput,content);
          });


      })
      .asCallback(next);

  }

  return {
    compile: compile,
    middleware: middleware
  };
};
