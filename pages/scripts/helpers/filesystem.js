var yaml = require('js-yaml');
var fs = require('fs-extra');

module.exports = function(locals) {

    var project = locals.project;

    project.extend.helper.register('yaml', function(yamlPath) {

        return yaml.safeLoad(fs.readFileSync(yamlPath,
            'utf8'
        ));

    });

};
