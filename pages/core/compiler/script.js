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
const webpack = require('webpack');
const util = require('util');

module.exports = function(locals) {

  var project = locals.project;

  function middleware(req, res, next) {
    var parsedPath = path.parse(req.path);

    switch (parsedPath.ext) {
      case '.js':

        if (path.parse(parsedPath.name).ext == '.min') {
          return next();
        }

        compile(req.path)
          .then(function() {
            next();
          })
          .catch(function(err) {
            if (err.notfound) {
              next();
            }
            res.setHeader('content-type', 'application/json');
            res.end(util.inspect(err));
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

    if (path.parse(pathRelative).ext == '.min.js') {
      return Promise.reject({
        message: 'We do not compile minified files'
      });
    }

    let pathRelativeParsed = path.parse(pathRelative);
    let presets = [
      [require.resolve('babel-preset-env'), {
        'targets': {
          'browsers': ['since 2013']
        }
      }]
    ];

    options = options || {};

    if (options.minify) {
      presets.push(require.resolve('babel-preset-minify'));
    }

    function canParse(testPath) {

      if (testPath.indexOf('/source/lib/') > 0) {
        return;
      }

      let parsed = path.parse(testPath);
      if (parsed.ext != '.js') {
        return;
      }

      parsed = path.parse(parsed.name);
      if (parsed.ext == '.min') {
        return;
      }

      //console.log('testPath == true',testPath);

      return true;

    }

    var modulesResolve = [
      project.paths.app.source,
      project.paths.theme.source
    ];

    if(locals.web){
      modulesResolve.push(project.paths.appPortal.source);
    }
    console.log('modulesResolve',modulesResolve);

    let compilerOptions = {
      entry: pathSource,
      devtool: 'source-map',
      target: 'web',
      resolve: {
        modules: modulesResolve
      },
      output: {
        path: path.join(project.paths.app.cache, pathRelativeParsed.dir),
        filename: pathRelativeParsed.base
      },
      module: {
        noParse: function(content) {
          return !canParse(content);
        },
        rules: [{
          test: function(content) {
            return !canParse(content);
          },
          use: require.resolve('source-map-loader'),
          enforce: 'pre'
        }, {
          test: canParse,
          loader: require.resolve('babel-loader'),
          options: {
            cacheDirectory: true,
            presets: presets,
            plugins: ['babel-plugin-angularjs-annotate'].map(require.resolve)
          }
        }]
      }
    };

    let compiler = webpack(compilerOptions);

    return new Promise(function(resolve, reject) {

      compiler.run(function(err, stats) {
        if (err) {
          return reject(err);
        }
        if (stats.compilation.errors.length) {
          return reject(stats.compilation.errors);
        }

        resolve(stats);
      });

    });
  }

  return {
    middleware: middleware,
    compile: compile
  };
};
