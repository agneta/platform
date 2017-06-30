module.exports = function(Model, app) {

    Model.remoteMethod(
        'details', {
            description: 'Get Activity by ID',
            accepts: [{
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
                verb: 'get',
                path: '/details'
            },
        }
    );

    Model.remoteMethod(
        'latest', {
            description: 'Get Latest number of activities',
            accepts: [{
                    arg: 'feed',
                    type: 'string',
                    required: false
                }, {
                    arg: 'unit',
                    type: 'string',
                    required: true
                }, {
                    arg: 'value',
                    type: 'number',
                    required: false
                }, {
                    arg: 'skip',
                    type: 'number',
                    required: false
                }, {
                    arg: 'year',
                    type: 'number',
                    required: false
                },
                {
                    arg: 'aggregate',
                    type: 'string',
                    required: false
                }, {
                    arg: 'req',
                    type: 'object',
                    'http': {
                        source: 'req'
                    }
                }
            ],
            returns: {
                arg: 'result',
                type: 'object',
                root: true
            },
            http: {
                verb: 'get',
                path: '/latest'
            },
        }
    );

};
