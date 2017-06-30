module.exports = function(Model, app) {

    Model.remoteMethod(
        'activitiesAdmin', {
            description: 'Get latest activities of a specified account.',
            accepts: [{
                arg: 'accountId',
                type: 'string',
                required: true
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
            },{
                arg: 'aggregate',
                type: 'string',
                required: false
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
                verb: 'post',
                path: '/activities-admin'
            },
        }
    );

};
