const path = require('path');
const eRecaptcha = require('express-recaptcha');
const loopback = require('loopback');
const utils = require('loopback/lib/utils');
const _ = require('lodash');
const assert = require('assert');
const urljoin = require('urljoin');

module.exports = function(Model, app) {

    Model.signOutAll = function(req) {

        var AccessToken = app.models.AccessToken;
        return AccessToken.destroyAll({
                userId: req.accessToken.userId
            })
            .then(function() {

                Model.activity({
                    req: req,
                    action: "logout_all"
                });

                return {
                    success: 'Cleared all access tokens'
                };
            });

    };

    Model.remoteMethod(
        'signOutAll', {
            description: 'Clear all tokens from this account',
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
                path: '/sign-out-all'
            }
        }
    );

    Model.afterRemote('signOutAll', Model.removeLoginCookie);

};
