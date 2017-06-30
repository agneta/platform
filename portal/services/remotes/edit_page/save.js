var Promise = require('bluebird');
var _ = require('lodash');
var yaml = require('js-yaml');
var path = require('path');
var fs = require('fs-promise');

module.exports = function(Model, app) {

    var web = app.get('options').web;
    var webPrj = web.project;

    Model.save = function(id, data, req) {

        return Model.getPage(id)
            .then(function(page) {

                var source = path.join(webPrj.paths.base, page.full_source);

                data = app.helpers.omitDeep(data, ['undefined', '$$hashKey']);
                data = _.omit(data, Model.omitData);

                var toSave = yaml.safeDump(data);

                return fs.writeFile(source, toSave);

            })
            .then(function(page) {

                var connection = app.portal.socket.currentConnection(req);
                if (connection) {
                    connection.emit('page-saved', id);
                }

            });

    };

    Model.remoteMethod(
        'save', {
            description: 'Save page data',
            accepts: [{
                arg: 'id',
                type: 'string',
                required: true
            }, {
                arg: 'data',
                type: 'object',
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
                path: '/save'
            },
        }
    );

};
