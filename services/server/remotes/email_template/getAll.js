const _ = require('lodash');

module.exports = function(Model) {

    Model.getAll = function() {

        return Promise.resolve()
            .then(function() {
                return {
                    list: _.keys(Model.__email.templates)
                };
            });

    };

    Model.remoteMethod(
        'getAll', {
            description: 'Return all email templates',
            accepts: [],
            returns: {
                arg: 'result',
                type: 'object',
                root: true
            },
            http: {
                verb: 'get',
                path: '/get-all'
            }
        }
    );

};
