const path = require('path');
const eRecaptcha = require('express-recaptcha');
const loopback = require('loopback');
const utils = require('loopback/lib/utils');
const _ = require('lodash');
const assert = require('assert');
const urljoin = require('urljoin');

module.exports = function(Model, app) {

    Model.recover = function(password, req) {

        return Model.findById(req.accessToken.userId)
            .then(function(account) {
                return account.updateAttributes({
                    deactivated: false,
                    password: password
                });
            })
            .then(function(user) {

                Model.activity({
                    req: req,
                    action: 'recovery'
                });

                return {
                    success: 'Your account is successfully recovered. Next time you login, enter your new password'
                };

            });

    };

    Model.remoteMethod(
        'recover', {
            description: 'Deactivate an account',
            accepts: [{
                arg: 'password',
                type: 'string',
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
                path: '/recover'
            }
        }
    );

};
