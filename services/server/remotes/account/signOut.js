const path = require('path');
const eRecaptcha = require('express-recaptcha');
const loopback = require('loopback');
const utils = require('loopback/lib/utils');
const _ = require('lodash');
const assert = require('assert');
const urljoin = require('urljoin');

module.exports = function(Model, app) {

    Model.signOut = function(req) {

        return Model.logout(req.accessToken.id)
            .then(function() {

                Model.activity({
                    req: req,
                    action: "logout"
                });

                return {
                    message: 'Logged out'
                };

            });

    };

    Model.remoteMethod(
        'signOut', {
            description: 'Logout a user',
            accepts: [{
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
                verb: 'get',
                path: '/sign-out'
            }
        }
    );

    Model.afterRemote('signOut', Model.removeLoginCookie);

};
