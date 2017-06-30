const Promise = require('bluebird');
const _ = require('lodash');
const geolib = require('geolib');

module.exports = function(app, options) {

    var defaultQuery = {
        returnGeometry: 'true',
        where: '1=1',
        outFields: options.fields || '*',
        geometryType: 'esriGeometryEnvelope',
        spatialRel: 'esriSpatialRelIntersects',
        geometryPrecision: '6',
    };

    function tile(geometry, req) {

        return Promise.resolve()
            .then(function() {

                if (options.maxDistance) {

                    var distance = geolib.getDistance({
                        latitude: geometry.xmin,
                        longitude: geometry.ymin
                    }, {
                        latitude: geometry.xmax,
                        longitude: geometry.ymax
                    });

                    if (distance > options.maxDistance) {
                        return {
                            error: 'Exceeded distance'
                        };
                    }

                }

                _.extend(geometry, {
                    spatialReference: {
                        wkid: 4326
                    }
                });
                var query = _.extend({
                    geometry: JSON.stringify(geometry)
                }, defaultQuery);
                //console.log(query,req.query);
                return app.esri.query(query);

            });


    }

    return tile;

};
