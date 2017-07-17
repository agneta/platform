
module.exports = function(Model) {

    Model.load = function(id) {
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
