var Promise = require('bluebird');

module.exports = function(Model, app) {

    var webPrj = app.get('options').web.project;


    Model.loadMany = function(template, req) {

        var pages = webPrj.site.pages.find({
            template: template
        }).toArray();

        return Promise.map(pages, function(page) {

                return {
                    id: page.path,
                    title: app.lng(page.title, req),
                    path: page.path
                };

            })
            .then(function(result) {
                return {
                    pages: result
                };
            });

    };

    Model.remoteMethod(
        'loadMany', {
            description: 'Load all pages by template',
            accepts: [{
                arg: 'template',
                type: 'string',
                required: true
            }, {
                arg: 'req',
                type: 'object',
                'http': {
                    source: 'req'
                }
            }],
            returns: {
                arg: 'result',
                type: 'object',
                root: true
            },
            http: {
                verb: 'get',
                path: '/load-many'
            },
        }
    );

};
