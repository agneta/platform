module.exports = function(Model, app) {

    Model.remoteMethod(
        'getByType', {
            description: '',
            accepts: [{
                arg: 'type',
                type: 'string',
                required: true
            }],
            returns: {
                arg: 'result',
                type: 'array',
                root: true
            },
            http: {
                verb: 'get',
                path: '/get-by-type'
            }
        }
    );

};
