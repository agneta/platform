/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/core/compiler/script.js
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
const path = require('path');
const _ = require('lodash');
const webpack = require('webpack');
const MemoryFS = require('memory-fs');

module.exports = function(locals) {

  var project = locals.project;
  const memFs = new MemoryFS();

  var helpers = {
    path: function(req) {
      return locals.app.locals.get_path(req);
    },
    configServices: function(prop) {
      return locals.services.get(prop);
    },
    config: function(prop) {
      return _.get(project.config, prop);
    },
    configPrj: function(prop) {
      return _.get(locals.web.project.config, prop);
    }
  };

  require('./template')(project, helpers);
  require('./bundle')(project, helpers);

  function middleware(req, res, next) {
    var parsedPath = path.parse(req.path);

    switch (parsedPath.ext) {
      case '.js':

        var path_partial = project.theme.getFile(path.join('source', req.path));

        if (path_partial) {
          var content = compile(req.path, {
            useBabel: true
          });
          res.setHeader('content-type', 'application/javascript');
          res.end(content);
          return;
        }
        break;
      default:
    }
    next();
  }

  function compile(path_partial, options) {

    options = options || {};
    console.log(options);
    let pathFile = project.theme.getFile(path_partial);

    console.log(pathFile);

    let compiler = webpack({
      entry: pathFile,
      loader: 'babel-loader',
      query: {
        presets: [
          ['agneta-platform/node_modules/babel-preset-env', {
            'targets': {
              'browsers': ['since 2013']
            }
          }], 'agneta-platform/node_modules/babel-preset-minify'
        ]
      }
    });

    compiler.outputFileSystem = memFs;

    return new Promise(function(resolve,reject){

      compiler.run(function(err,stats){
        if(err){
          return reject(err);
        }
        console.log(stats);
        resolve(stats);
      });

    });
  }

  return {
    middleware: middleware,
    compile: compile
  };
};
