const path = require('path');
const eRecaptcha = require('express-recaptcha');
const loopback = require('loopback');
const utils = require('loopback/lib/utils');
const _ = require('lodash');
const assert = require('assert');
const urljoin = require('urljoin');

module.exports = function(Model, app) {

    Model.signedIn = function(req, cb) {
        cb(null, {
            result: req.accessToken ? true : false
        });
    };

    Model.remoteMethod(
        'signedIn', {
            description: 'Check if user is signed in.',
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
                path: '/signed-in'
            }
        }
    );

};
