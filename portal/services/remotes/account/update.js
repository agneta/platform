var _ = require('lodash');

module.exports = function(Model, app) {

    Model.update = function(req, data) {
        return Model.findById(data.id)
            .then(function(account) {
                data = _.pick(data, ['name', 'username', 'email']);
                return account.updateAttributes(data);
            });
    };

    Model.remoteMethod(
        'update', {
            description: "",
            accepts: [{
                arg: 'req',
                type: 'object',
                'http': {
                    source: 'req'
                }
            }, {
                arg: 'data',
                type: 'object',
                required: true
            }],
            returns: {
                arg: 'result',
                type: 'object',
                root: true
            },
            http: {
                verb: 'post',
                path: '/update'
            }
        }
    );

};
