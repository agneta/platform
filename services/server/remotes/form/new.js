var _ = require('lodash');

module.exports = function(Model, app) {

    Model.prepareFields = function(options) {

        var data = options.data;
        var form;

        for (var key in data.fields) {
            var field = data.fields[key];

            if (_.isObject(field)) {
                field = _.pick(field, ['title', 'value']);
                if (_.isObject(field.title)) {
                    field.title = app.lng(field.title, options.language || options.req);
                }
                data.fields[key] = field;
                continue;
            }

            if (!form) {
                form = app.models.Form.formServices.methods[options.form];
            }

            var fieldConfig = form.remote.fields[key];
            if (fieldConfig) {
                data.fields[key] = {
                    title: app.lng(fieldConfig.title, options.language || options.req),
                    value: field
                };
            }

        }

    };

    Model.new = function(options) {

        options.language = app.getLng(options.req);
        options.accountId = options.req.accessToken && options.req.accessToken.userId;

        if (_.isObject(options.title)) {
            options.title = app.lng(options.title, options.language);
        }

        var result = _.pick(options, [
            'title',
            'name',
            'data',
            'accountId',
            'language',
        ]);

        Model.prepareFields = (result.data, options.language);

        return Model.create(result);

    };

};
