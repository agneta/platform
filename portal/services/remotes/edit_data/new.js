var Promise = require('bluebird');
var _ = require('lodash');
var yaml = require('js-yaml');
var path = require('path');
var fs = require('fs-promise');

module.exports = function(Model, app) {

    var web = app.get('options').web;
    var webPrj = web.project;

    Model.new = function(title, dataPath, template, req) {

        var id = path.join(template, dataPath);
        var source = path.join(webPrj.paths.data, id + '.yml');

        var yamlTitle = {};
        yamlTitle[app.getLng(req)] = title;

        var name = path.parse(dataPath).name;

        return app.git.createYaml(source, {
                name: name,
                title: yamlTitle
            })
            .then(function() {
                return {
                    id: id
                };
            });

    };

    Model.remoteMethod(
        'new', {
            description: 'Create new page',
            accepts: [{
                arg: 'title',
                type: 'string',
                required: true
            }, {
                arg: 'path',
                type: 'string',
                required: true
            }, {
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
                verb: 'post',
                path: '/new'
            },
        }
    );

};
