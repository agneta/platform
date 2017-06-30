const path = require('path');
const _ = require('lodash');
const Promise = require('bluebird');

module.exports = function(Model, app) {

    var configRoles = app.get('roles');

    Model.hasRoles = function(roles, req) {

        return Promise.resolve()
            .then(function() {

                var role;

                for (role of roles) {
                    if (!configRoles[role]) {
                        return {
                            message: 'Role does not exist',
                            role: role
                        };
                    }
                }

                if (!req.accessToken) {
                    return {
                        loggedOut: true,
                        message: 'User not logged in'
                    };
                }

                var fields = {};

                for (role of roles) {
                    fields[role] = true;
                }

                return Model.findById(req.accessToken.userId, {
                        include: roles,
                        fields: fields
                    })
                    .then(function(account) {
                        var has = [];

                        for (role of roles) {
                            if (account[role]) {
                                has.push(role);
                            }
                        }

                        if (!has.length) {
                            return {
                                message: 'User does not have any of these roles'
                            };
                        }

                        return {
                            message: 'Found roles for user',
                            has: has
                        };
                    });
            });

    };

    Model.remoteMethod(
        'hasRoles', {
            description: 'Check if a user has any of the requested roles.',
            accepts: [{
                arg: 'roles',
                type: 'array',
                required: true,
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
                path: '/has-roles'
            },
        }
    );

};
