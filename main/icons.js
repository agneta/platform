var path = require('path');
var fs = require('fs-extra');
var ProgressBar = require('progress');
var Promise = require('bluebird');
var promiseCopy = Promise.promisify(fs.copy);
var chalk = require('chalk');
var glob = Promise.promisify(require('glob'));
var lstat = Promise.promisify(fs.lstat);

module.exports = function(paths) {

    var icons = {};
    var searchTarget = 'node_modules/material-design-icons';

    var searchDir = path.join(paths.project, searchTarget);

    try{
      fs.statSync(searchDir);
    }catch(e){
      searchDir = path.join(paths.baseTheme, searchTarget);
    }


    console.log();
    console.log('-----------------------------------');
    console.log(chalk.blue('Searching for Icons...'));

    return Promise.promisify(fs.readdir)(searchDir)
        .then(function(files) {

            var result = [];

            return Promise.map(files, function(file) {

                    var base = path.join(file, 'svg', 'production');
                    var svgDir = path.join(searchDir, base);

                    return lstat(svgDir)
                        .then(function(stats) {
                            return glob('**/*_24px.svg', {
                                cwd: svgDir,
                                nodir: true,
                                nosort: true,
                                stat: false
                            });
                        })
                        .then(function(found) {
                            result.push({
                                base: base,
                                files: found
                            });
                        })
                        .catch(function() {

                        });
                })
                .then(function() {
                    return result;
                });
        })
        .then(function(result) {

            var names = [];

            return Promise.map(result, function(dir) {
                return Promise.map(dir.files, function(file) {
                    var parsed = path.parse(file);
                    var name = parsed.name;
                    name = name.split('_');
                    name.pop();
                    name.shift();
                    name = name.join('_');

                    icons[name] = path.join(dir.base, file);
                    names.push(name);
                });
            })
            .then(function(){
              return names;
            });
        })
        .then(function(names) {

            bar = new ProgressBar('[:bar] :percent', {
                total: names.length
            });

            return Promise.map(names, function(name) {
                var sourcePath = path.join(searchDir, icons[name]);
                var destPath = path.join(paths.baseTheme, 'icons', name + '.svg');
                return promiseCopy(sourcePath, destPath)
                    .then(function() {
                        bar.tick();
                    });
            }, {
                concurrency: 1
            });
        })
        .then(function() {
            console.log(chalk.green('Success: Icons are transfered'));
            console.log('-----------------------------------');
            console.log();
        });
};
