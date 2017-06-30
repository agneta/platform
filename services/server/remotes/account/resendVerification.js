const path = require('path');
const eRecaptcha = require('express-recaptcha');
const loopback = require('loopback');
const utils = require('loopback/lib/utils');
const _ = require('lodash');
const assert = require('assert');
const urljoin = require('urljoin');

module.exports = function(Model, app) {

    Model.resendVerification = function(email) {
        return Model.findOne({
                where: {
                    email: email
                }
            })
            .then(function(account) {
                if (!account) {

                    var err1 = new Error('Account not found');
                    err1.statusCode = 400;
                    err1.code = 'ACC_NOT_FOUND';

                    throw err1;

                }

                if (account.verified) {

                    var err2 = new Error('Account is akready verified');
                    err2.statusCode = 400;
                    err2.code = 'ACC_ALREADY_VERIFIED';

                    throw err2;

                }

                return {
                    account: account,
                    success: 'We are sending you another email for verifying your account.'
                };
            });
    };

    Model.remoteMethod(
        'resendVerification', {
            description: 'Send verification letter to the given email.',
            accepts: [{
                arg: 'email',
                type: 'string',
                required: true,
            }],
            returns: {
                arg: 'result',
                type: 'object',
                root: true
            },
            http: {
                verb: 'post',
                path: '/resend-verification'
            }
        }
    );

    Model.afterRemote('resendVerification', Model._sendVerification);

};
