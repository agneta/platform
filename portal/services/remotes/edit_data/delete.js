var yaml = require('js-yaml');
var path = require('path');
var fs = require('fs-promise');

module.exports = function(Model, app) {

    Model.delete = function(id) {
        var parsedId = Model.parseId(id);
        return fs.remove(parsedId.source);
    };

    Model.remoteMethod(
        'delete', {
            description: 'Delete a file',
            accepts: [{
                arg: 'id',
                type: 'string',
                required: true
            }],
            returns: {
                arg: 'result',
                type: 'object',
                root: true
            },
            http: {
                verb: 'post',
                path: '/delete'
            },
        }
    );

};
