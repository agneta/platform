var chokidar = require('chokidar');
var path = require('path');
var yaml = require('js-yaml');
var fs = require('fs');
var _ = require('lodash');
var Promise = require('bluebird');

module.exports = function(app) {

    var options = app.get('options');
    var locals = options.client;
    var webLocals = options.web;

    init(locals);
    init(webLocals);

    //////////////////////////////////////////////////////////

    function init(locals) {
        var project = locals.project;

        var watcher = chokidar.watch([
            // Project folders
            project.paths.source,
            project.paths.data,
            project.paths.config,
            // Theme folders
            project.paths.sourceTheme,
            project.paths.dataTheme,
            project.paths.configTheme,
        ], {
            ignoreInitial: true,
            ignored: /[\/\\]\./
        });

        watcher.on('add', function(pathFile, stats) {
            onWatcher(pathFile);
        });

        watcher.on('change', function(pathFile, stats) {
            onWatcher(pathFile);
        });

        watcher.on('unlink', function(pathFile, stats) {
            onWatcher(pathFile);
        });

        var updating = false;
        var queued = null;

        function onWatcher(pathFile) {

            if (updating) {
                queued = pathFile;
                return;
            }

            queued = null;
            updating = true;

            return onUpdate(pathFile)
                .then(function() {
                    return Promise.delay(1000);
                })
                .then(function() {
                    updating = false;
                    if (queued) {
                        return onWatcher(queued);
                    }
                });
        }

        //////////////////////////////////////////////////////////

        function onUpdate(pathFile) {

            var params = path.parse(pathFile);

            switch (params.ext) {
                case '.yml':

                    var promise = locals.main.load.pages();

                    if (
                        params.dir.indexOf(project.paths.dataTheme) === 0 ||
                        params.dir.indexOf(project.paths.data) === 0
                    ) {
                        locals.cache.data.invalidate(pathFile);
                    }

                    if (
                        pathFile.indexOf(project.paths.configTheme) === 0 ||
                        pathFile.indexOf(project.paths.config) === 0
                    ) {
                        promise = promise.then(locals.main.load.config());
                    }

                    return promise
                        .then(function() {
                            project.call_listeners('ready');
                        })
                        .delay(100)
                        .then(function() {
                            reload();
                        })
                        .catch(function(error) {
                            console.error(error);
                        });

                case '.styl':
                    reload();
                    break;
                case '.js':
                    reload();
                    break;
                case '.ejs':
                    locals.cache.templates.invalidate(pathFile);
                    reload();
                    break;
            }

            function reload() {
                //console.log('reload');
                app.portal.socket.emit('page-reload');
            }

            return Promise.resolve();
        }
    }

};
