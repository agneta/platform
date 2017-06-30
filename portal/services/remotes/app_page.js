module.exports = function(Model, app) {

    app.helpers.mixin("disableAllMethods", Model);

    Model.save = function(data) {

        if (!data.path) {
            return Promise.reject({
                message: 'Path is required'
            });
        }

        data.path = app.helpers.fixPath(data.path);

        return Model.findOne({
                where: {
                    path: data.path
                }
            })
            .then(function(page) {
                if (page) {
                    return page.updateAttributes(data);
                } else {
                    return Model.create(data);
                }
            });

    };

    Model.remoteMethod(
        'save', {
            description: 'Save page data',
            accepts: [{
                arg: 'data',
                type: 'object',
                required: true
            }],
            returns: {
                arg: 'result',
                type: 'object',
                root: true
            },
            http: {
                verb: 'post',
                path: '/save'
            },
        }
    );
};
