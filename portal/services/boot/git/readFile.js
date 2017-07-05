const Promise = require('bluebird');
const nodegit = require('nodegit');
const path = require('path');
const _ = require('lodash');
const yaml = require('js-yaml');

module.exports = function(app) {

    app.git.readFile = function(options) {

        var file = app.git.getPath(options.file);
        var command = `${options.commit}:${file}`;

        return app.git.native.show([command]);
    };

};
