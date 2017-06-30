var _ = require('lodash');

module.exports = function(Model, app) {

    Model.roleAdd = function(id, name) {

        return Model._roleAdd(id, name)
            .then(function(result) {
                return {
                    success: 'The role was added'
                };
            });

    };

    Model.remoteMethod(
        'roleAdd', {
            description: "",
            accepts: [{
                arg: 'id',
                type: 'string',
                required: true
            }, {
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
                path: '/role-add'
            }
        }
    );

};
