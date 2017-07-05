module.exports = function(Model) {


    Model.restart = function() {

        process.send({
            restart: true
        });

    };

    Model.remoteMethod(
        'restart', {
            description: 'Restart the application',
            accepts: [],
            returns: {
                arg: 'result',
                type: 'object',
                root: true
            },
            http: {
                verb: 'post',
                path: '/restart'
            },
        }
    );

};
