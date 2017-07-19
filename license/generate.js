const klaw = require('klaw');
const Promise = require('bluebird');
const path = require('path');
const fs = require('fs-extra');
const progress = require('progress');
const _ = require('lodash');

var sourcePaths = [];
var template;

var copyrightStart = '/*   Copyright 2017 Agneta';
var copyrightEnd = ' */\n';

return Promise.resolve()
    .then(function() {

        return fs.readFile(path.join(__dirname, 'template.ejs'), {
            encoding: 'utf8'
        });

    })
    .then(function(content) {
        if (content.indexOf(copyrightStart) !== 0) {
            return Promise.reject(`Copyright must start with '${copyrightStart}'`);
        }
        if (content.indexOf(copyrightEnd) !== content.length - copyrightEnd.length) {
            return Promise.reject(`Copyright must end with '${copyrightEnd}'`);
        }
        template = _.template(content);

    })
    .then(function() {

        var pathSources = path.join(__dirname, '..');
        var walker = klaw(pathSources);
        var exclude = [
            'node_modules',
            'theme/bower_components',
            'portal/bower_components'
        ];

        walker.on('data', function(item) {

            if (item.stats.isDirectory()) {
                return;
            }

            var path_parsed = path.parse(item.path);
            var path_rel = path.relative(pathSources, item.path);

            for (var excludeItem of exclude) {
                if (path_rel.indexOf(excludeItem) === 0) {
                    return;
                }
            }

            switch (path_parsed.ext) {
                case '.js':
                    console.log(path_rel);
                    sourcePaths.push({
                        absolute: item.path,
                        relative: path_rel
                    });
                    break;
            }

        });

        return new Promise(function(resolve, reject) {
            walker.on('end', resolve);
            walker.on('error', reject);
        });

    })
    .then(function() {

        var bar = new progress('[:bar] :percent', {
            total: sourcePaths.length
        });

        return Promise.map(sourcePaths, function(sourcePath) {

            return fs.readFile(sourcePath.absolute, {
                    encoding: 'utf8'
                })
                .then(function(content) {

                    var indexStart = content.indexOf(copyrightStart);
                    if (indexStart === 0) {
                        var indexEnd = content.indexOf(copyrightEnd);
                        if (indexEnd < 0) {
                            return Promise.reject('Could not find end of copyright');
                        }
                        content = content.slice(indexEnd + copyrightEnd.length);
                    }

                    var header = template({
                        path: sourcePath.relative
                    });

                    content = header + content;

                    fs.writeFile(sourcePath.absolute, content);
                    bar.tick();
                });
        }, {
            concurrency: 1
        });
    });
