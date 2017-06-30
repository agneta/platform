const _ = require('lodash');

module.exports = function(Model, app) {

    Model.activity = function(options) {

        var type = 'engagement';
        var data = _.extend({}, options.data);
        var accountId = options.accountId || (options.req.accessToken && options.req.accessToken.userId);

        app.models.Activity_Item.new({
            accountId: accountId,
            feed: type,
            req: options.req,
            action: {
                value: options.action,
                type: type
            },
            data: data
        });

    };

};
