var Promise = require('bluebird');

module.exports = function(Model, app) {

    Model.stop = function(name) {
        return Model.getUtility(name)
            .then(function(utility) {
                var instance = utility.instance;
                if (!instance.status.running) {
                    return Promise.reject({
                        statusCode: 400,
                        message: 'Instance has already stopped'
                    });
                }

                instance.promise.cancel();
                instance.status.running = false;
                utility.emit('status', instance.status);

                return {
                    success: 'Instance has stopped running'
                };
            });
    };

    Model.remoteMethod(
        'stop', {
            description: 'Stop a utility',
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
                verb: 'post',
                path: '/stop'
            }
        });


};
