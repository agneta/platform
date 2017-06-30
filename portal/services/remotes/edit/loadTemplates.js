var fs = require('fs-promise');
var path = require('path');
var Promise = require('bluebird');
var yaml = require('js-yaml');
var klaw = require('klaw');

module.exports = function(Model, app) {

    var project = app.get('options').client.project;

    Model.loadTemplates = function(req) {

        var items = [];

        return new Promise(function(resolve, reject) {
                klaw(Model.editConfigDir)
                    .on('data', function(item) {
                        if (!item.stats.isFile()) {
                            return;
                        }
                        items.push(item);
                    })
                    .on('error', reject)
                    .on('end', resolve);

            })
            .then(function() {

                return Promise.map(items, function(item) {
                    return fs.readFile(item.path)
                        .then(function(content) {
                            var data = yaml.safeLoad(content);
                            var id = path.relative(Model.editConfigDir, item.path).slice(0, -4);
                            return {
                                id: id,
                                title: app.lng(data.title, req)
                            };
                        });

                });
            })
            .then(function(templates) {
                return {
                    templates: templates
                };
            });

    };

    Model.remoteMethod(
        'loadTemplates', {
            description: 'Load all templates with optional limit',
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
                path: '/load-templates'
            },
        }
    );

};
