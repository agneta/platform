var Promise = require('bluebird');

module.exports = function(util) {

    var project = util.locals.project;

    return {
        run: function(options) {

            var servicesWebsite = util.locals.web.services;
            var servicesPortal = util.locals.services;

            return Promise.map([
                    servicesPortal,
                    servicesWebsite
                ], function(service) {
                    return service.generate.methods();
                })
                .then(function() {
                    util.success('Exported Services');
                });

        }
    };

};
