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

module.exports = function(locals) {

  var project = locals.project;

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

  function middleware(req, res, next) {
    var parsedPath = path.parse(req.path);

    switch (parsedPath.ext) {
      case '.js':

        compile(req.path)
          .then(function() {
            next();
          })
          .catch(function(err) {
            if (err.notfound) {
              next();
            }
            res.setHeader('content-type', 'application/json');
            res.end(JSON.stringify(err, null, 2));
          });

        return;
    }
    next();
  }

  function compile(pathRelative, options) {

    var pathSource = project.theme.getFile(path.join('source', pathRelative));

    if (!pathSource) {
      return Promise.reject({
        notfound: true,
        message: `Did not find the source file at ${pathRelative}`
      });
    }

    let pathRelativeParsed = path.parse(pathRelative);

    options = options || {};

    console.log(options);
    console.log('pathSource', pathSource);

    let compilerOptions = {
      entry: pathSource,
      output: {
        path: path.join(project.paths.app.cache,pathRelativeParsed.dir),
        filename: pathRelativeParsed.base
      },
      module: {
        rules: [{
          test: /\.js$/,
          loader: require.resolve('babel-loader'),
          options: {
            cacheDirectory: true,
            presets: [
              [require.resolve('babel-preset-env'), {
                'targets': {
                  'browsers': ['since 2013']
                }
              }], require.resolve('babel-preset-minify')
            ]
          }
        }]
      }
    };

    let compiler = webpack(compilerOptions);

    console.log(compilerOptions);

    return new Promise(function(resolve, reject) {

      compiler.run(function(err, stats) {
        if (err) {
          return reject(err);
        }
        if (stats.compilation.errors.length) {
          return reject(stats.compilation.errors);
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
