const klaw = require('klaw');
const Promise = require('bluebird');
const path = require('path');
const fs = require('fs-extra');
const progress = require('progress');

var sourcePaths = [];

return Promise.resolve()
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
                    sourcePaths.push(item.path);
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

            return fs.readFile(sourcePath, {
                    encoding: 'utf8'
                })
                .then(function(content) {
                    bar.tick();
                });
        }, {
            concurrency: 10
        });
    });
