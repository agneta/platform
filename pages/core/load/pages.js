var _ = require('lodash');

module.exports = function(locals) {

    var project = locals.project;

    locals.renderData = function(data) {

        var data_render = _.extend({
            page: data,
            config: project.config,
            site: project.site
        });

        var body = locals.app.locals.template('body', data_render);
        data_render.body = body;

        return locals.app.locals.template('layout', data_render);
    };

    return function() {

        return require('../generators')(locals)
            .catch(function(err) {
                console.error(err);
                console.error(err.stack);
            })
            .then(function() {
                //console.log('Loaded all pages');
            });
    };

};
