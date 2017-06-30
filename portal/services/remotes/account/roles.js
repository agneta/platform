var _ = require('lodash');

module.exports = function(Model, app) {

    Model.roles = function(cb) {

        var result = _.map(Model.roleKeys, function(key) {
            var role = Model.roleOptions[key];
            return {
                name: key
            };
        });
        cb(null, result);
    };

    Model.remoteMethod(
        'roles', {
            description: "Get all roles an account can have",
            accepts: [],
            returns: {
                arg: 'result',
                type: 'array',
                root: true
            },
            http: {
                verb: 'get',
                path: '/roles'
            }
        }
    );

};
