const Promise = require('bluebird');
const fs = require('fs-promise');
const yaml = require('js-yaml');
const path = require('path');
const _ = require('lodash');
const templateBase = require('./templateBase');
const loadTemplate = require('../edit/loadTemplate');

module.exports = function(Model, app) {

    var source;
    var template;

    if (!fs.existsSync(Model.editConfigDir)) {
        throw new Error("Create an edit directory and add your configurations: " + Model.editConfigDir);
    }

    Model.loadOne = function(id, req) {

        var page;
        var log;

        return Model.getPage(id)
            .then(function(_page) {

                //////////////////////////////////////////
                page = _page;
                source = Model.pageSource(page);

                return app.git.log({
                    file: source
                });

            })
            .then(function(_log) {

                log = _log;

                return loadTemplate({
                    path: path.join(Model.editConfigDir, page.template + '.yml'),
                    req: req,
                    app: app
                });

            })
            .then(function(_template) {

                template = _template;
                template.id = page.template;
                templateBase(template);

                return fs.readFile(source);
            })
            .then(function(content) {

                var data = yaml.safeLoad(content);

                return {
                    page: {
                        data: data,
                        path: page.path,
                        id: id,
                        log: log
                    },
                    template: template
                };
            });

    };

    Model.remoteMethod(
        'loadOne', {
            description: 'Load page with specified ID',
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
