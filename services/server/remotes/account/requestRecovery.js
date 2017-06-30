const path = require('path');
const eRecaptcha = require('express-recaptcha');
const loopback = require('loopback');
const utils = require('loopback/lib/utils');
const _ = require('lodash');
const assert = require('assert');
const urljoin = require('urljoin');

module.exports = function(Model, app) {

    Model.requestRecovery = function(email, req) {

        var account;

        return Model.findOne({
                where: {
                    email: email
                }
            })
            .then(function(_account) {

                account = _account;

                if (!account) {

                    var err1 = new Error('Email not recognized');
                    err1.statusCode = 400;
                    err1.code = 'ACC_NOT_FOUND';

                    throw err1;
                }

                if (!account.deactivated) {

                    var err2 = new Error('Account is already active');
                    err2.statusCode = 400;
                    err2.code = 'ACC_ALREADY_ACTIVE';

                    throw err2;

                }

                var options = {
                    email: email
                };

                return Model.resetPassword(options);

            })
            .then(function() {

                Model.activity({
                    req: req,
                    accountId: account.id,
                    action: 'recovery_request'
                });

                return {
                    success: 'We sent you an email with a link to reset your password'
                };
            });

    };

    Model.remoteMethod(
        'requestRecovery', {
            description: 'Deactivate an account',
            accepts: [{
                arg: 'email',
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
                path: '/request-recovery'
            }
        }
    );

};
