var yaml = require('js-yaml');
var Promise = require('bluebird');
var fs = require('fs-extra');
var readFile = Promise.promisify(fs.readFile);
var _ = require('lodash');
var path = require('path');
var loadTemplate = require('../edit/loadTemplate');

module.exports = function(Model, app) {

    var project = app.get('options').client.project;
    var webPrj = app.get('options').web.project;

    Model.loadOne = function(id, req) {

        var template;
        var log;
        var parsedId = Model.parseId(id);

        return loadTemplate({
                path: path.join(Model.editConfigDir, parsedId.templateId + '.yml'),
                req: req,
                app: app
            }).then(function(_template) {

                template = _template;
                template.id = parsedId.templateId;

                return app.git.log({
                    file: parsedId.source
                });
            })
            .then(function(_log) {
                log = _log;
                return readFile(parsedId.source);
            })
            .then(function(content) {

                var data = yaml.safeLoad(content);

                return {
                    page: {
                        id: id,
                        data: data,
                        log: log,
                        path: '/' + parsedId.fileName
                    },
                    template: template
                };

            });
    };

    Model.remoteMethod(
        'loadOne', {
            description: 'Load Project Data with specified ID',
            accepts: [{
                arg: 'id',
                type: 'string',
                required: true
            }, {
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
                path: '/load-one'
            },
        }
    );

};
