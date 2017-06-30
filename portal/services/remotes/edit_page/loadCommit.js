var yaml = require('js-yaml');
var path = require('path');

module.exports = function(Model, app) {

    Model.loadCommit = function(id, commit) {
        return Model.getPage(id)
            .then(function(page) {
                var source = Model.pageSource(page);
                return app.git.readYaml({
                        file: source,
                        commit: commit
                    })
                    .then(function(data) {
                        return {
                            data: data
                        };
                    });
            });
    };

    Model.remoteMethod(
        'loadCommit', {
            description: 'load file add a specific commit',
            accepts: [{
                arg: 'id',
                type: 'string',
                required: true
            }, {
                arg: 'commit',
                type: 'string',
                required: true
            }],
            returns: {
                arg: 'result',
                type: 'object',
                root: true
            },
            http: {
                verb: 'get',
                path: '/load-commit'
            },
        }
    );

};
