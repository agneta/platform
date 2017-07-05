var _ = require('lodash');
var path = require('path');
var saveYaml = require('../edit/saveYaml');

module.exports = function(Model, app) {

    var web = app.get('options').web;
    var webPrj = web.project;

    Model.save = function(id, data, req) {

        return Model.getPage(id)
            .then(function(page) {

                var source = path.join(webPrj.paths.base, page.full_source);

                data = _.omit(data, Model.omitData);
                return saveYaml(source, data);

            })
            .then(function() {

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
