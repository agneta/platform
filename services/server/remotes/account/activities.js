module.exports = function(Model, app) {

    Model.activities = function(unit, value, skip, year,aggregate, req) {

        var accountId = req.accessToken.userId;
        return Model.activitiesAdmin(accountId, unit, value, skip, year,aggregate, req);

    };

    Model.activitiesAdmin = function(accountId, unit, value, skip, year, aggregate, req) {

        return app.models.Activity_Feed.findOne({
                where: {
                    and: [{
                        type: 'account'
                    }, {
                        value: '_' + accountId
                    }]
                }
            })
            .then(function(feed) {
                if (!feed) {
                    return {
                        message: 'Feed not found for account',
                        activities: []
                    };
                }

                return app.models.Activity_Item.latest(
                    feed.id,
                    unit, value, skip, year, aggregate
                );
            });

    };


    Model.remoteMethod(
        'activities', {
            description: 'Get latest activities of authenticated user.',
            accepts: [{
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
                path: '/activities'
            },
        }
    );


};
