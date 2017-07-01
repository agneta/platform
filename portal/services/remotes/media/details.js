module.exports = function(Model) {

    Model.details = function(id, location) {

        var promise;

        if (id) {
            promise = Model.findById(id);
        }

        if (location) {
            promise = Model.findOne({
                where: {
                    location: Model.__fixPath(location)
                }
            });
        }

        if (!promise) {
            throw new Error('Must provide the file id or location');
        }

        return promise.then(function(object) {
            if (!object) {
                return {
                    notfound: 'Not found on database'
                };
            }

            return Model.__prepareObject(object);
        });

    };

    Model.remoteMethod(
        'details', {
            description: "Get a file details",
            accepts: [{
                arg: 'id',
                type: 'string',
                required: false
            }, {
                arg: 'location',
                type: 'string',
                required: false
            }],
            returns: {
                arg: 'result',
                type: 'object',
                root: true
            },
            http: {
                verb: 'get',
                path: '/details'
            }
        }
    );
};
