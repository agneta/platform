module.exports = function(Model) {

    Model.newFolder = function(name, dir) {

        return Model.create({
            name: name,
            location: Model.__getMediaPath(dir, name),
            type: 'folder'
        });

    };

    Model.remoteMethod(
        'newFolder', {
            description: "Upload a file",
            accepts: [{
                arg: 'name',
                type: 'string',
                required: true
            }, {
                arg: 'dir',
                type: 'string',
                required: false
            }],
            returns: {
                arg: 'result',
                type: 'object',
                root: true
            },
            http: {
                verb: 'post',
                path: '/new-folder'
            }
        }
    );

};
