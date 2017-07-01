var yaml = require('js-yaml');
var path = require('path');
var fs = require('fs-extra');

module.exports = function(Model, app) {

    Model.delete = function(id) {
        return Model.getPage(id)
            .then(function(page) {
                var source = Model.pageSource(page);
                console.log(source);
                return fs.remove(source);
            });
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
