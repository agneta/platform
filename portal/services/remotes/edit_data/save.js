var Promise = require('bluebird');
var _ = require('lodash');
var yaml = require('js-yaml');
var path = require('path');
var fs = require('fs-promise');

module.exports = function(Model, app) {

    var web = app.get('options').web;
    var webPrj = web.project;

    Model.save = function(id, data) {

        var filePath = path.join(webPrj.paths.data, id + '.yml');

        return fs.access(filePath)
            .then(function() {
                data = app.helpers.omitDeep(data, ['undefined', '$$hashKey']);
                return fs.writeFile(filePath, yaml.safeDump(data));
            })
            .then(function() {
                var relativePath = filePath.substring(webPrj.paths.base.length);
                return {
                    message: `Data saved at:\n${relativePath}`
                };
            });

    };

    Model.remoteMethod(
        'save', {
            description: 'Save project data',
            accepts: [{
                arg: 'id',
                type: 'string',
                required: true
            }, {
                arg: 'data',
                type: 'object',
                required: true
            }],
            returns: {
                arg: 'result',
                type: 'object',
                root: true
            },
            http: {
                verb: 'post',
                path: '/save'
            },
        }
    );

};
