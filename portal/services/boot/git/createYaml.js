var Promise = require('bluebird');
var nodegit = require('nodegit');
var path = require('path');
var _ = require('lodash');
var yaml = require('js-yaml');
var fs = require('fs-extra');


module.exports = function(app) {

    app.git.createYaml = function(filePath, data) {

        if (fs.existsSync(filePath)) {
            return Promise.reject({
                statusCode: 400,
                message: 'File already exists'
            });
        }

        return fs.writeFile(filePath, yaml.safeDump(data));

    };

};
