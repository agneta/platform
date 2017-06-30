var _ = require('lodash');

module.exports = function(Model, app) {

    Model.remove = function(req, id) {

        return Model.findById(id)
            .then(function(account) {
                if (!account) {
                    throw new Error('Account not found');
                }
                return account.destroy();
            });

    };


    Model.remoteMethod(
        'remove', {
            description: "Get user's administrative settings",
            accepts: [{
                arg: 'req',
                type: 'object',
                'http': {
                    source: 'req'
                }
            }, {
                arg: 'id',
                type: 'string',
                required: true
            }],
            returns: {
                arg: 'result',
                type: 'object',
                root: true
            },
            http: {
                verb: 'post',
                path: '/remove'
            }
        }
    );

};
