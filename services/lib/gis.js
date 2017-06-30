const Promise = require('bluebird');
const _ = require('lodash');
const loopback = require('loopback');

module.exports = function(app) {

    app.gis = {
        remoteNetwork: function(options) {

            options = options || {};

            var Model = options.model;
            var name = options.name;
            options.geoModel = options.geoModel || Model.definition.name;

            var sources = {
                local: require('./gis/local')(options),
                esri: require('./gis/esri')(app, options)
            };

            //-----------------------------------------------------------------

            Model[name] = function(geometry, req) {

                if (!geometry) {
                    return Promise.resolve({
                        message: 'No geometry given'
                    });
                }

                geometry = {
                    xmin: parseFloat(geometry.xmin),
                    xmax: parseFloat(geometry.xmax),
                    ymin: parseFloat(geometry.ymin),
                    ymax: parseFloat(geometry.ymax)
                };

                return sources[options.source](geometry,req);
            };

            //-----------------------------------------------------------------

            Model.remoteMethod(
                name, {
                    description: 'Geometry network',
                    accepts: [{
                            arg: 'geometry',
                            type: 'object',
                            required: false
                        },
                        {
                            arg: 'req',
                            type: 'object',
                            'http': {
                                source: 'req'
                            }
                        }
                    ],
                    returns: {
                        arg: 'result',
                        type: 'string',
                        root: true
                    },
                    http: {
                        verb: 'get',
                        path: '/' + name
                    },
                }
            );

            //-----------------------------------------------------------------

            Model.beforeRemote(name, function(context, account, next) {

                var geometry = context.req.query.geometry;

                if (geometry) {

                    try {
                        geometry = JSON.parse(geometry);
                    } catch (e) {
                        return next({
                            message: 'Could not parse the geometry field'
                        });
                    }

                    if (!geometry.xmin ||
                        !geometry.xmax ||
                        !geometry.ymin ||
                        !geometry.ymax
                    ) {
                        return next({
                            message: 'Not a valid geometry object.'
                        });
                    }

                }


                next();

            });

        }
    };

};
