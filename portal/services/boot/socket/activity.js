var prettyBytes = require('pretty-bytes');
var _ = require('lodash');

module.exports = function(app) {

    var socket = app.portal.socket;

    app.models.Activity_Item.observe('after save', function(ctx) {

        var instance = ctx.instance;

        var response = {
            time: instance.time,
            actionId: instance.actionId,
        };

        if (instance.accountId) {
            app.models.Account.findById(instance.accountId)
                .then(function(account) {
                    response.account = account;
                    socket.emit('activity:new', response);
                });
        }


    });

};
