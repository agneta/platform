var fs = require('fs-extra');
var path = require('path');
var yaml = require('js-yaml');
var _ = require('lodash');

module.exports = function(locals) {

    var project = locals.project;
    var webPrj = locals.web.project;
    var editConfigDir = path.join(webPrj.paths.project, 'edit', 'data');

    project.on('ready', function() {

        if (!fs.existsSync(editConfigDir)) {

            project.editDataConfig = [];
            return;

        }

        var files = fs.readdirSync(editConfigDir);
        var result = [];

        for (var filename of files) {

            var filenameParsed = path.parse(filename);
            if (filenameParsed.ext != '.yml') {
                continue;
            }

            var config = _.extend({
                    name: filenameParsed.name
                },
                yaml.safeLoad(
                    fs.readFileSync(
                        path.join(editConfigDir, filename)
                    )
                )
            );

            result.push(config);
        }

        project.editDataConfig = result;
    });

};
