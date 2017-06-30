const path = require('path');
const eRecaptcha = require('express-recaptcha');
const loopback = require('loopback');
const utils = require('loopback/lib/utils');
const _ = require('lodash');
const assert = require('assert');
const urljoin = require('urljoin');

module.exports = function(Model, app) {

    var email = app.get('email');

    Model.sendVerification = function(options) {

        var language = app.getLng(options.req);

        var verifyHref = urljoin(app.get('website').url, language, 'login',
            '?action=verify' +
            '&uid=' + options.account.id
        );

        return options.account.verify({
            type: 'email',
            to: options.account.email,
            from: email.contacts.support,
            subject: options.subject || 'Thanks for registering.',
            language: language,
            req: options.req,
            templateName: options.template || 'verify',
            user: options.account,
            verifyHref: verifyHref
        });

    };

    Model._sendVerification = function(context, result, next) {

        Model.sendVerification({
                account: result.account,
                req: context.req
            })
            .then(function() {
                return {
                    success: result.success
                };
            });

    };

    Model.prototype.verify = function(options, fn) {
        fn = fn || utils.createPromiseCallback();

        var user = this;
        var userModel = this.constructor;
        var registry = userModel.registry;
        assert(typeof options === 'object', 'options required when calling user.verify()');
        assert(options.verifyHref, 'You must supply a verification href');
        assert(options.type, 'You must supply a verification type (options.type)');
        assert(options.type === 'email', 'Unsupported verification type');
        assert(options.to || this.email, 'Must include options.to when calling user.verify() or the user must have an email property');
        assert(options.from, 'Must include options.from when calling user.verify()');

        // Email model
        var Email = options.mailer || this.constructor.email || registry.getModelByType(loopback.Email);

        // Set a default token generation function if one is not provided
        var tokenGenerator = options.generateVerificationToken || Model.generateVerificationToken;

        tokenGenerator(user,null, function(err, token) {
            if (err) {
                return fn(err);
            }

            user.verificationToken = token;
            user.save(function(err) {
                if (err) {
                    fn(err);
                } else {
                    sendEmail(user);
                }
            });
        });

        // TODO - support more verification types
        function sendEmail(user) {
            options.verifyHref += '&token=' + user.verificationToken;

            options.data = {
              verifyHref: options.verifyHref
            };

            options.to = options.to || user.email;
            options.subject = options.subject;
            options.headers = options.headers || {};

            Email.send(options, function(err, email) {
                if (err) {
                    fn(err);
                } else {
                    fn(null, {
                        email: email,
                        token: user.verificationToken,
                        uid: user.id
                    });
                }
            });
        }
        return fn.promise;
    };

};
