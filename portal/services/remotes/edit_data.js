var path = require('path');

module.exports = function(Model, app) {

    app.helpers.mixin("disableAllMethods", Model);
    var webPrj = app.get('options').web.project;

    Model.editConfigDir = path.join(webPrj.paths.project, 'edit', 'data');

    Model.parseId = function(id) {

        var split = id.split('/');
        var fileName = split.pop();
        var templateId = split.join('/');
        var source = path.join(webPrj.paths.data, templateId, fileName + '.yml');

        return {
            templateId: templateId,
            fileName: fileName,
            source: source
        };

    };

    require('./edit_data/loadCommit')(Model, app);
    require('./edit_data/loadOne')(Model, app);
    require('./edit_data/delete')(Model, app);
    require('./edit_data/save')(Model, app);
    require('./edit_data/new')(Model, app);
    require('./edit_data/loadMany')(Model, app);
    require('./edit/loadTemplates')(Model, app);

};
