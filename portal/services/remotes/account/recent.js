var _ = require('lodash');

module.exports = function(Model, app) {

    Model.recent = function(limit) {

        limit = limit || 5;

        return Model.find({
            order: 'createdAt',
            limit: limit
        });

    };


    Model.remoteMethod(
        'recent', {
            description: 'Get recently created accounts',
            accepts: [{
                arg: 'limit',
                type: 'number',
                required: false
            }],
            returns: {
                arg: 'result',
                type: 'array',
                root: true
            },
            http: {
                verb: 'get',
                path: '/recent'
            }
        }
    );

};
