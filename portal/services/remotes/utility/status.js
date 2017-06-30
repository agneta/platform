module.exports = function(Model, app) {

    Model.state = function(name) {
        return Model.getUtility(name)
            .then(function(utility) {
                return {
                    status: utility.instance.status,
                    parameters: utility.instance.parameters
                };
            });
    };

    Model.remoteMethod(
        'state', {
            description: 'Get current state of the utility',
            accepts: [{
                arg: 'name',
                type: 'string',
                required: true
            }],
            returns: {
                arg: 'result',
                type: 'object',
                root: true
            },
            http: {
                verb: 'get',
                path: '/state'
            },
        }
    );

};
