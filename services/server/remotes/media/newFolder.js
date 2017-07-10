module.exports = function(Model) {

    Model.newFolder = function(name, dir) {

        var location = Model.__getMediaPath(dir, name);

        return Model.findOrCreate({
                where: {
                    location: location
                },
                fields: {
                    id: true
                }
            }, {
                name: name,
                location: location,
                type: 'folder'
            })
            .then(function(res) {
                return res[1];
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
