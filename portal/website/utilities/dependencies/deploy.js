module.exports = function(util) {

    var webProject = util.locals.web.project;
    var services = util.locals.services;
    var sync = require('../sync')(util);

    var storageConfig = services.get('storage');

    util.log('Dependencies Sync Start');
    return sync({
            target: storageConfig.buckets.lib.name,
            source: webProject.paths.lib
        })
        .then(function() {
            util.log('Dependencies Sync Complete');
        });

};
