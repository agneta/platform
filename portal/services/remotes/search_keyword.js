module.exports = function(Model, app) {

    Model.remoteMethod(
        'clear', {
            description: 'Clear all the search data',
            accepts: [],
            returns: {
                arg: 'result',
                type: 'object',
                root: true
            },
            http: {
                verb: 'post',
                path: '/clear'
            }
        }
    );

    Model.remoteMethod(
        'get', {
            description: 'Get All Keywords by language',
            accepts: [{
                arg: 'lang',
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
                path: '/get'
            }
        }
    );

};
