var fs = require('fs');
var path = require('path');
var _ = require('lodash');

module.exports = function(locals) {

    var project = locals.project;

    project.on('ready', function() {

        if (!project.site.lang) {
            throw new Error("Uknown Language!");
        }

        project.site.sitemap = {
            path: 'sitemap_' + project.site.lang + '.xml'
        };

        project.site.languages = {};

        for (var language of project.config.languages) {
            project.site.languages[language.key] = language.value;
        }

        project.site.lang_full = project.site.languages[project.site.lang];
        project.site.lang_others = _.omit(project.site.languages, [project.site.lang]);

    });

};
