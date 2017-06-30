var fs = require("fs");
var path = require("path");
var ejs = require('ejs');
var _ = require('lodash');

module.exports = function(locals) {

    var project = locals.project;

    project.theme = {

        readDir: function(base) {

            var dirs = [
                path.join(project.paths.baseTheme, base),
                path.join(project.paths.base, base)
            ];

            var files = {};

            for (var dir of dirs) {

                var stats = null;

                try {
                    stats = fs.statSync(dir);
                } catch (e) {}

                if (stats && stats.isDirectory()) {

                    var _files = fs.readdirSync(dir);

                    for (var i in _files) {

                        var _file = _files[i];
                        files[_file] = path.join(dir, _file);
                    }

                }
            }

            return _.values(files);
        },
        getFile: function(getPath) {
            return getObject(getPath, 'isFile');
        },
        getDir: function(getPath) {
            return getObject(getPath, 'isDirectory');
        },
        getTemplateFile: function(getFile) {
            var result = project.theme.getFile(getFile);
            if (result) {
                return result;
            }
            return project.theme.getFile(path.join('source', getFile));
        },
        readTemplateDir: function(dir) {
            var result = project.theme.readDir(dir);
            if (result) {
                return result;
            }
            return project.theme.readDir(path.join('source', dir));
        }
    };

    function getObject(getPath, method) {

        var filePaths = [
            path.join(project.paths.base, getPath),
            path.join(project.paths.baseTheme, getPath)
        ];
        var filePath;

        for (filePath of filePaths) {

            var stats;

            try {
                stats = fs.lstatSync(filePath);
            } catch (e) {}

            if (stats && stats[method]()) {

                return filePath;

            }
        }

        return false;

    }
};
