var Promise = require('bluebird');

module.exports = function(util) {

    var webProject = util.locals.web.project;

    return {
        run: function() {

            var servicesWebsite = util.locals.web.services;
            var servicesPortal = util.locals.services;

            return Promise.map([{
                        server: servicesPortal,
                        dir: webProject.paths.portalGenerated
                    },
                    {
                        server: servicesWebsite,
                        dir: webProject.paths.generated
                    }
                ], function(service) {


                    return service.server.generate.methods({
                        outputDir: service.dir
                    });
                })
                .then(function() {
                    util.success('Exported Services');
                });

        }
    };

};
