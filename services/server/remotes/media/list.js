module.exports = function(Model) {

    Model._list = function(dir, limit, marker) {

        var objects = [];
        var whereFilter = [];

        return Promise.resolve()
            .then(function() {
                marker = marker || 0;
                dir = dir || '';

                //---------------------------------------------------

                dir = dir.split('/').join('\\/');
                if (dir && dir.length) {
                    dir += '\\/';
                }

                var regexp = '/^' + dir + '[^\\/]+$/';

                whereFilter = {
                    location: {
                        regexp: regexp
                    }
                };

                return Model.find({
                    where: whereFilter,
                    limit: limit,
                    skip: marker,
                    order: ['type ASC', 'name ASC']
                });
            })
            .then(function(_objects) {

                for (var object of _objects) {
                    Model.__prepareObject(object);
                }

                objects = _objects;

                return Model.count(
                    whereFilter
                );
            })
            .then(function(count) {

                var truncated = (count - marker) > limit;
                var nextMarker;
                var nextLimit;

                if (truncated) {
                    nextMarker = marker + limit;
                    nextLimit = Math.min(count - nextMarker, limit);
                }

                return {
                    objects: objects,
                    nextMarker: nextMarker,
                    nextLimit: nextLimit,
                    truncated: truncated,
                    count: count
                };
            });

    };

    Model.list = function(dir, marker) {

        return Model._list(dir, 20, marker);
    };

    Model.remoteMethod(
        'list', {
            description: "List the files",
            accepts: [{
                arg: 'dir',
                type: 'string',
                required: false
            }, {
                arg: 'marker',
                type: 'number',
                required: false
            }],
            returns: {
                arg: 'result',
                type: 'object',
                root: true
            },
            http: {
                verb: 'post',
                path: '/list'
            }
        }
    );

};
