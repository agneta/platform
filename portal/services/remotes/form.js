var _ = require('lodash');
var Promise = require('bluebird');

module.exports = function(Model, app) {

    Model.load = function(id, req) {
        return Model.findById(id);
    };

    Model.remoteMethod(
        'load', {
            description: 'Load a form by its ID.',
            accepts: [{
                arg: 'id',
                type: 'string',
                required: true
            }, {
                arg: 'req',
                type: 'object',
                'http': {
                    source: 'req'
                }
            }],
            returns: {
                arg: 'result',
                type: 'object',
                root: true
            },
            http: {
                verb: 'get',
                path: '/load'
            },
        }
    );

};
