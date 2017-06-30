var _ = require('lodash');

module.exports = function(Model, app) {

    Model.roleGet = function(accountId, roleName) {

        return Model.findById(accountId)
            .then(function(account) {

                if (!account) {
                    throw new Error("Account not found");
                }

                var role = Model.roleOptions[roleName];

                if (!role) {
                    throw new Error('No role found: ' + roleName);
                }

                var RoleModel = app.models[role.model];

                return RoleModel.findOne({
                    where: {
                        accountId: account.id
                    }
                });

            });

    };

    Model.remoteMethod(
        'roleGet', {
            description: "",
            accepts: [{
                arg: 'accountId',
                type: 'string',
                required: true
            }, {
                arg: 'roleName',
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
                path: '/role-get'
            }
        }
    );

};
