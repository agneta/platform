var fs = require('fs');
var path = require('path');

module.exports = function(locals) {

    var project = locals.project;

    project.on('ready', function() {

        var scripts = project.config.scripts;

        if (project.config.contact_form) {
            scripts.push('main/contact');
        }

        if (project.site.services) {

            scripts.push('main/interceptors');
            scripts.push('main/account');

            project.config.angular_libs.push({
                dep: 'lbServices',
                js: 'generated/services'
            });

            if (project.site.lang == 'gr') {
                scripts.push('main/greeklish');
            }

        } else {

            if (project.config.search) {
                console.warn('Search disabled because the API is not set');
            }

        }
        if (!project.site.building) {

            scripts.push('lib/socketcluster.min');
            scripts.push('main/socket');
            scripts.push('main/portal');

        }


    });

};
