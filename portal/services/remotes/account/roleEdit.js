var _ = require('lodash');

module.exports = function(Model, app) {

    var rolesConfig = app.get('roles');

    Model.roleEdit = function(accountId, roleName, data) {

        var roleConfig = rolesConfig[roleName];
        if (!roleConfig.form) {
            return Promise.reject('No form for role is available');
        }

        var fieldNames = [];

        for (var field of roleConfig.form.fields) {
            if (field.name) {
                fieldNames.push(field.name);
            }
        }

        return Model.roleGet(accountId, roleName)
            .then(function(role) {
                console.log(fieldNames, data);
                data = _.pick(
                    data,
                    fieldNames
                );

                if (!_.keys(data).length) {
                    return Promise.reject('Nothing to update');
                }

                return role.updateAttributes(data);

            })
            .then(function() {
                return {
                    success: 'The role is updated!'
                };
            });

    };

    Model.remoteMethod(
        'roleEdit', {
            description: "",
            accepts: [{
                arg: 'accountId',
                type: 'string',
                required: true
            }, {
                arg: 'roleName',
                type: 'string',
                required: true
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
                path: '/role-edit'
            }
        }
    );

};
