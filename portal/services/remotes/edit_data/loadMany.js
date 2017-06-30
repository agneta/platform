var fs = require('fs-extra');
var path = require('path');
var Promise = require('bluebird');
var yaml = require('js-yaml');
var readdir = Promise.promisify(fs.readdir);
var readFile = Promise.promisify(fs.readFile);

module.exports = function(Model, app) {

    var project = app.get('options').client.project;
    var webProject = app.get('options').web.project;

    Model.loadMany = function(template, req) {

        var templateDir = path.join(webProject.paths.data, template);

        return readdir(templateDir)
            .then(function(files) {

                return Promise.map(files, function(fileName) {
                    return readFile(
                            path.join(templateDir, fileName)
                        )
                        .then(function(content) {

                            var data = yaml.safeLoad(content);
                            var fileNameParsed = path.parse(fileName);
                            var name = fileNameParsed.name;

                            return {
                                title: app.lng(data.title, req),
                                path: '/' + name,
                                id: [template, name].join('/')
                            };
                        });
                });

            })
            .then(function(result) {

                return {
                    pages: result
                };
            });

    };

    Model.remoteMethod(
        'loadMany', {
            description: 'Load all pages with optional limit',
            accepts: [{
                arg: 'template',
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
                path: '/load-many'
            },
        }
    );

};
