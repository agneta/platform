var yaml = require('js-yaml');
var fs = require('fs-extra');
var path = require('path');
var _ = require('lodash');

module.exports = function(locals) {

    var project = locals.project;
    var utilities = {};

    var baseDirs = [{
        builtin: false,
        dir: path.join(project.paths.project, 'utilities'),
    }, {
        builtin: true,
        dir: path.join(project.paths.portalWebsite, 'utilities')
    }];

    baseDirs.forEach(function(options) {

        var baseDir = options.dir;
        if (!fs.existsSync(baseDir)) {
            return;
        }
        var dirs = fs.readdirSync(baseDir);

        dirs.forEach(function(dir) {

            var utilPath = path.join(baseDir, dir);
            var stats = fs.statSync(utilPath);

            if (!stats.isDirectory()) {
                return;
            }

            var configPath = path.join(utilPath, 'config.yml');

            var config = yaml.safeLoad(fs.readFileSync(configPath,
                'utf8'
            ));

            utilities[dir] = {
                name: dir,
                path: utilPath,
                builtin: options.builtin,
                runner: require(utilPath),
                config: config
            };
        });
    });

    project.utilities = utilities;

    var utilPages = [];

    _.values(utilities).forEach(function(utility) {

        var pageData = _.extend({
            name: utility.name,
            builtin: utility.builtin,
            path: 'utility/' + utility.name,
            template: 'utility',
            viewData: {
                name: utility.name
            }
        }, utility.config);

        utilPages.push(pageData);

    });

    project.site.utilities = utilPages;

    project.extend.generator.register('utilities', function(locals) {
        return utilPages;
    });

};
