var fs = require('fs-extra');
var path = require('path');
var _ = require('lodash');

var yaml = require('js-yaml');

module.exports = function(locals) {

    var project = locals.project;
    var templates;

    function run() {

        //console.log('Get rules..');

        templates = {};

        var dataPathTheme = path.join(project.paths.baseTheme, 'rules.yml');
        var dataPath = path.join(project.paths.base, 'rules.yml');

        fs.ensureFileSync(dataPathTheme);
        var dataTheme = yaml.safeLoad(fs.readFileSync(dataPathTheme, 'utf8'));

        fs.ensureFileSync(dataPath);
        var data = yaml.safeLoad(fs.readFileSync(dataPath, 'utf8'));

        _.mergeWith(data, dataTheme, mergeFn);

        if (data) {

            for (var props of data) {

                if (props.templates) {

                    for (var name of props.templates) {

                        var template = templates[name] || {
                            scripts: [],
                            styles: []
                        };
                        _.mergeWith(template, props.data, mergeFn);
                        templates[name] = template;
                    }
                }
            }
        }

        return project.site.pages.map(function(page) {
            processData(page);
            return page.save();
        });

    }

    function mergeFn(objValue, srcValue) {
        if (_.isArray(objValue) || _.isArray(srcValue)) {
            objValue = objValue || [];
            srcValue = srcValue || [];

            return _.uniq(srcValue.concat(objValue));
        }
    }

    function processData(data) {

        data.styles = data.styles || [];
        data.scripts = data.scripts || [];

        /////////////////////////////////////

        if (data.path) {
            var parsedPath = path.parse(data.path);
            data.path_name = parsedPath.name;
        }

        /////////////////////////////////////

        var templateData = templates[data.templateSource || data.template];
        if (templateData) {
            _.mergeWith(data, templateData, mergeFn);
        }

        return data;

    }

    return {
      run: run
    };

};
