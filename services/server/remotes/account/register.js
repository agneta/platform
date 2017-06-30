const path = require('path');
const eRecaptcha = require('express-recaptcha');
const loopback = require('loopback');
const utils = require('loopback/lib/utils');
const _ = require('lodash');
const assert = require('assert');
const urljoin = require('urljoin');

module.exports = function(Model, app) {

    Model.register = function(email, password, recaptcha) {

        return Model.create({
                email: email,
                password: password
            })
            .then(function(account) {
                return {
                    account: account,
                    success: {
                        title: 'Thank you for registering',
                        content: 'We sent an email for you to verify your account'
                    }
                };
            });

    };

    Model.remoteMethod(
        'register', {
            description: 'Register user with email and password.',
            accepts: [{
                arg: 'email',
                type: 'string',
                required: true,
            }, {
                arg: 'password',
                type: 'string',
                required: true
            }, {
                arg: 'recaptcha',
                type: 'string',
                required: false
            }],
            returns: {
                arg: 'result',
                type: 'object',
                root: true
            },
            http: {
                verb: 'post',
                path: '/register'
            }
        }
    );

    if (false) { // Fix this
        Model.beforeRemote('register', function(context, account, next) {

            var recaptcha = context.req.recaptcha;

            eRecaptcha.verify(recaptcha, function(error) {

                if (error) {
                    return next({
                        code: 'RECAPTCHA_ERROR',
                        message: 'The recaptcha you sent is invalid',
                        data: error
                    });
                }

                next();
            });

        });
    }

    Model.afterRemote('register', Model._sendVerification);

};
