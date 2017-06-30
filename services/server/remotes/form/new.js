var _ = require('lodash');
var Promise = require('bluebird');

module.exports = function(Model, app) {

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

        for (var key in result.data.fields) {
            var field = result.data.fields[key];
            field = _.pick(field, ['title', 'value']);
            field.title = app.lng(field.title, options.language);
            result.data.fields[key] = field;
        }

        return Model.create(result);

    };

};
