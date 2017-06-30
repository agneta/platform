const path = require('path');
const eRecaptcha = require('express-recaptcha');
const loopback = require('loopback');
const utils = require('loopback/lib/utils');
const _ = require('lodash');
const assert = require('assert');
const urljoin = require('urljoin');

module.exports = function(Model, app) {

    Model.deactivate = function(password, req) {

        return Model.signOutAll(req)
            .then(function() {
                return Model.findById(req.accessToken.userId);
            })
            .then(function(account) {
                return account.updateAttributes({
                    deactivated: true
                });
            })
            .then(function() {

                Model.activity({
                    req: req,
                    action: 'deactivate'
                });

                return {
                    success: {
                        title: 'Deactivation Complete',
                        content: 'You may recover your account by trying to login again.'
                    }
                };

            });

    };

    Model.remoteMethod(
        'deactivate', {
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
                path: '/deactivate'
            }
        }
    );

    Model.beforeRemote('deactivate', app.helpers.resubmitPassword);


};
