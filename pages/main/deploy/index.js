var yaml = require('js-yaml');
var path = require('path');
var fs = require('fs');

module.exports = function(locals) {

    var path_public = path.join(locals.build_dir, 'public');
    var path_views = path.join(locals.build_dir, 'views');
    var container;

    locals.main.loadConfig()
        .then(function() {

            container = require('./container')(locals);

            return container.sync({
                name: 'public',
                path: path_public
            });

        })
        .then(function() {
            return container.sync({
                name: 'views',
                path: path_views
            });
        })
        .then(function() {
            console.log('Deployment Complete');
        });
};
