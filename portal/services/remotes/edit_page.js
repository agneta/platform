var path = require('path');
var Promise = require('bluebird');

module.exports = function(Model, app) {

    app.helpers.mixin("disableAllMethods", Model);

    Model.omitData = [
        '_model',
        '_schema',
        'source',
        'slug',
        'published',
        'date',
        'updated',
        'filename',
        '_id',
        'id',
        'isSource',
        'controller',
        'scripts',
        'styles',
        'isSource',
        'pathSource',
        'pathView',
        'pathData',
        'path',
        'path_name',
        'full_source'
    ];

    var webPrj = app.get('options').web.project;

    Model.editConfigDir = path.join(webPrj.paths.project, 'edit', 'pages');

    Model.getPage = function(path) {

        var page = webPrj.site.pages.findOne({
            path: path
        });

        if (!page) {

            return Promise.reject({
                statusCode: 400,
                message: 'Page not found: ' + path
            });
        }

        return Promise.resolve(page);
    };

    Model.pageSource = function(page) {
        return path.join(webPrj.paths.base, page.full_source);
    };

    require('./edit_page/loadCommit')(Model, app);
    require('./edit_page/loadOne')(Model, app);
    require('./edit_page/delete')(Model, app);
    require('./edit_page/save')(Model, app);
    require('./edit_page/new')(Model, app);
    require('./edit_page/loadMany')(Model, app);
    require('./edit/loadTemplates')(Model, app);

};
