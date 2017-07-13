const page = require('../../pages/page');
const path = require('path');
const _ = require('lodash');
const Promise = require('bluebird');
const File = require('../../pages/file');
const yaml = require('js-yaml');
const replaceExt = require('replace-ext');
const klaw = require('klaw');

module.exports = function(locals) {

    var project = locals.project;

    project.extend.generator.register('pages', function() {

        var pageDirs = [
            project.paths.sourceTheme,
            project.paths.source
        ];

        var result = {};

        return Promise.resolve()
            .then(function() {
                return Promise.map(pageDirs, function(dir) {

                    var walker = klaw(dir);
                    var paths = [];

                    walker.on('data', function(item) {
                        var path_file_parsed = path.parse(item.path);

                        if (item.stats.isDirectory()) {
                            return;
                        }

                        if (path_file_parsed.ext != '.yml') {
                            return;
                        }

                        paths.push(item.path);
                    });

                    return new Promise(function(resolve, reject) {
                            walker.on('end', function() {
                                resolve(paths);
                            });
                            walker.on('error', reject);
                        })
                        .then(function(files) {

                            return Promise.map(files, function(path_file) {

                                var filePath = path.relative(dir, path_file);
                                var path_url = filePath.split(path.sep).join('/');

                                if (pageExists(path_url)) {
                                    return;
                                }

                                var file = new File({
                                    source: path_file,
                                    path: filePath,
                                    type: "create",
                                    params: {
                                        path: path_url
                                    }
                                });

                                return readFile(file)
                                    .then(function(data) {
                                        if (!data) {
                                            return;
                                        }
                                        data.path = data.path || path_url;

                                        //---------------------------------------
                                        // Partials

                                        if (data.path.indexOf('partial/') === 0) {
                                            data.barebones = true;
                                            data.viewOnly = true;
                                        }

                                        //---------------------------------------
                                        // Search for template if not defined

                                        if (!data.template) {

                                            var templatePath = path.join(
                                                'source',
                                                replaceExt(data.path, '.ejs')
                                            );

                                            templatePath = project.theme.getFile(
                                                templatePath
                                            );

                                            if (templatePath) {
                                                templatePath = path.parse(data.path);
                                                templatePath = path.join(
                                                    templatePath.dir,
                                                    templatePath.name);
                                                data.template = templatePath;
                                            }

                                        }

                                        //---------------------------------------


                                        addPage(data);
                                    });

                            }, {
                                concurrency: 10
                            });
                        });
                }, {
                    concurrency: 1
                });
            })
            .then(function() {
                return _.values(result);
            });

        function pageExists(dataPath) {
            var pagePath = page.parseFilename(dataPath);
            return result[pagePath] ? true : false;
        }

        function addPage(data) {
            var pagePath = page.parseFilename(data.path);
            result[pagePath] = data;
        }


    });


    function readFile(file) {

        return Promise.all([
            file.stat(),
            file.read()
        ]).spread(function(stats, content) {

            try {
                data = yaml.safeLoad(content);
            } catch (e) {
                console.error('Found problem on YAML: ' + path);
                throw e;
            }

            if (!data) {
                return;
            }

            data.source = file.path;
            data.filename = path.parse(data.source).name;

            return data;
        });
    }

};
