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
const _ = require('lodash');
module.exports = function(locals) {

  var project = locals.project;
  var modulesResolve;

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
            if (err.notfound || err.skip) {
              return next();
            }
            res.setHeader('content-type', 'application/json');
            res.end(util.inspect(err));
          });

        return;
    }
    next();
  }

  function compile(pathRelative,options) {

    options = options || {};

    let pathSource;

    if(options.base){
      pathSource = path.join(options.base,pathRelative);
    }else{
      pathSource = project.theme.getFile(path.join('source', pathRelative));
    }

    let pathOutput = options.output || project.paths.app.cache;
    let pathRelativeParsed = path.parse(pathRelative);
    let pathNameParsed = path.parse(pathRelativeParsed.name);

    if (!pathSource) {
      return Promise.reject({
        notfound: true,
        message: `Did not find the source file at ${pathRelative}`
      });
    }

    if (pathRelative.indexOf('/lib/') == 0) {
      return Promise.reject({
        skip: true,
        message: 'We do not compile library files'
      });
    }

    if (pathNameParsed.ext == '.min') {
      return Promise.reject({
        skip: true,
        message: 'We do not compile minified files'
      });
    }

    if (pathNameParsed.ext == '.module') {
      return Promise.reject({
        message: 'Modules are not supposed to be loaded'
      });
    }

    let presets = [
      [require.resolve('babel-preset-env'), {
        'targets': {
          'browsers': ['since 2013']
        }
      }],
      require.resolve('babel-preset-minify')
    ];

    function canParse(testPath) {
      //console.log(testPath);
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

      return true;

    }

    let output = {
      path: path.join(pathOutput, pathRelativeParsed.dir),
      filename: options.outputName || pathRelativeParsed.base
    };

    if(options.onOutputPath){
      output = options.onOutputPath(output);
    }

    let compilerOptions = {
      entry: pathSource,
      devtool: 'source-map',
      target: 'web',
      resolve: {
        modules: modulesResolve
      },
      output: output,
      module: {
        noParse: function(content) {
          return !canParse(content);
        },
        rules: [{
          test: canParse,
          loader: path.join(__dirname,'script-template'),
          enforce: 'pre',
          options: {
            locals: locals,
          }
        },{
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
    init: function(){
      modulesResolve = _.map(project.theme.dirs,function(dir){
        return path.join(dir,'source');
      });
    },
    middleware: middleware,
    compile: compile
  };
};
