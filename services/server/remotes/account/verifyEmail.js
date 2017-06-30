const path = require('path');
const eRecaptcha = require('express-recaptcha');
const loopback = require('loopback');
const utils = require('loopback/lib/utils');
const _ = require('lodash');
const assert = require('assert');
const urljoin = require('urljoin');

module.exports = function(Model, app) {

    Model.verifyEmail = function(uid, token, req) {

        return Model.confirm(uid, token, null)
            .then(function() {

                Model.activity({
                    req: req,
                    accountId: uid,
                    action: "verify"
                });

                return {
                    success: 'Now you can login to your account using your email and password'
                };

            });

    };


    Model.remoteMethod(
        'verifyEmail', {
            description: 'Confirm a account registration with uid verification token.',
            accepts: [{
                arg: 'uid',
                type: 'string',
                required: true
            }, {
                arg: 'token',
                type: 'string',
                required: true
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
                path: '/verify'
            },
        }
    );

};
