const path = require('path');
const eRecaptcha = require('express-recaptcha');
const loopback = require('loopback');
const utils = require('loopback/lib/utils');
const _ = require('lodash');
const assert = require('assert');
const urljoin = require('urljoin');

module.exports = function(Model, app) {

    var roles = app.get('roles');
    var roleKeys = _.keys(roles);

    Model.includeRoles = _.map(roleKeys, function(name) {
        var role = roles[name];
        return {
            relation: name,
            scope: {
                include: role.include
            }
        };
    });

};
