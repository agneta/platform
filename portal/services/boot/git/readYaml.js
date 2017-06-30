var Promise = require('bluebird');
var nodegit = require('nodegit');
var path = require('path');
var _ = require('lodash');
var yaml = require('js-yaml');


module.exports = function(app) {

    app.git.readYaml = function(options) {

        return app.git.readFile(options)
            .then(function(content) {
                return yaml.safeLoad(content);
            });

    };
};
