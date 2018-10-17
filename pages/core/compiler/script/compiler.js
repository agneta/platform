const webpack = require('webpack');
const path = require('path');
const _ = require('lodash');
const fs = require('fs-extra');
const Promise = require('bluebird');

module.exports = function(locals) {
  var project = locals.project;
  var modulesResolve;

  function init() {
    modulesResolve = _.map(project.theme.dirs, function(dir) {
      return path.join(dir, 'source');
    });
    modulesResolve.push(path.join(process.cwd(), 'node_modules'));
  }

  function run(pathRelative, options) {
    options = options || {};

    let pathSource;

    if (options.base) {
      pathSource = path.join(options.base, pathRelative);
    } else {
      pathSource = project.theme.getFile(path.join('source', pathRelative));
    }
    let pathOutput = options.output || project.paths.app.cache;
    let pathRelativeParsed = path.parse(pathRelative);
    let pathNameParsed = path.parse(pathRelativeParsed.name);
    let output = {
      path: path.join(pathOutput, pathRelativeParsed.dir),
      filename: options.outputName || pathRelativeParsed.base
    };

    if (options.onOutputPath) {
      output = options.onOutputPath(output);
    }

    let metaPath = path.join(
      output.path,
      path.parse(output.filename).name + '.meta.json'
    );
    let meta,
      stats,
      depDict = {};

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
      [
        require.resolve('@babel/preset-env'),
        {
          targets: {
            browsers: ['since 2013']
          }
        }
      ],
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

    return Promise.resolve()
      .then(function() {
        return fs
          .stat(pathSource)
          .then(function(_stats) {
            stats = _stats;

            return fs.exists(metaPath);
          })
          .then(function(exists) {
            if (!exists) {
              return;
            }
            return fs.readJson(metaPath).then(function(_meta) {
              meta = _meta;
              let deps = meta.dependencies || [];
              let depChanged = false;
              return Promise.map(deps, function(dep) {
                if (!dep || !dep.source) {
                  return;
                }
                return fs.stat(dep.source).then(function(depStat) {
                  var changed = depStat.mtimeMs != dep.mtimeMs;
                  depDict[dep] = {
                    mtimeMs: depStat.mtimeMs,
                    changed: changed
                  };
                  if (changed) {
                    depChanged = changed;
                  }
                });
              }).then(function() {
                if (depChanged) {
                  return;
                }
                if (stats.mtimeMs == meta.mtimeMs) {
                  return true;
                }
              });
            });
          });
      })
      .then(function(cannotCompile) {
        if (cannotCompile) {
          //console.log(`skipped compilation: ${pathSource}`);
          return;
        }
        let compilerOptions = {
          entry: pathSource,
          devtool: 'source-map',
          target: 'web',
          /* TODO: Be able to import libraries without bundling
      externals: [
        function(context, request, callback) {
          console.log(context, request);
          if (/^yourregex$/.test(request)) {
            return callback(null, 'root ' + request);
          }
          callback();
        }
      ],*/
          resolve: {
            modules: modulesResolve
          },
          output: output,
          module: {
            noParse: function(content) {
              return !canParse(content);
            },
            rules: [
              {
                test: canParse,
                loader: path.join(__dirname, 'template'),
                enforce: 'pre',
                options: {
                  locals: locals
                }
              },
              {
                test: function(content) {
                  return !canParse(content);
                },
                use: require.resolve('source-map-loader'),
                enforce: 'pre'
              },
              {
                test: canParse,
                loader: require.resolve('babel-loader'),
                options: {
                  cacheDirectory: true,
                  presets: presets,
                  plugins: ['babel-plugin-angularjs-annotate'].map(
                    require.resolve
                  )
                }
              }
            ]
          }
        };

        let compiler = webpack(compilerOptions);

        return new Promise(function(resolve, reject) {
          compiler.run(function(err, stats) {
            if (err) {
              return reject(err);
            }
            let compilation = stats.compilation;
            if (compilation.errors.length) {
              console.error(compilation.errors);
              return reject(compilation.errors[0]);
            }

            resolve(compilation);
          });
        }).then(function(compilation) {
          var dependencies = Array.from(compilation.fileDependencies);
          var depResult = [];
          return Promise.map(dependencies, function(dep) {
            var depData = depDict[dep] || {};

            return Promise.resolve()
              .then(function() {
                if (depData.mtimeMs && !depData.changed) {
                  return;
                }
                if (!depData.mtimeMs) {
                  return fs.stat(dep).then(function(depStat) {
                    depData.mtimeMs = depStat.mtimeMs;
                  });
                }
              })
              .then(function() {
                depResult.push({
                  mtimeMs: depData.mtimeMs,
                  source: dep
                });
              });
          }).then(function() {
            //console.log(dependencies);
            return fs.outputJson(metaPath, {
              mtimeMs: stats.mtimeMs,
              dependencies: depResult
            });
          });
        });
      });
  }

  return {
    init: init,
    run: run
  };
};
