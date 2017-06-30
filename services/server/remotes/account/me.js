const path = require('path');
const eRecaptcha = require('express-recaptcha');
const loopback = require('loopback');
const utils = require('loopback/lib/utils');
const _ = require('lodash');
const assert = require('assert');
const urljoin = require('urljoin');

module.exports = function(Model, app) {

    Model.me = function(req) {

        if (!req.accessToken) {
            return Promise.resolve()
                .then(function() {
                    return {
                        message: 'Not logged in'
                    };
                });
        }

        return Model.findById(req.accessToken.userId, {
            include: Model.includeRoles
        });

    };

    Model.remoteMethod(
        'me', {
            description: 'View current user profile.',
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
                path: '/me'
            },
        }
    );

};
