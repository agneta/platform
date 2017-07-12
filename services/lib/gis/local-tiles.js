const ArcGIS = require('terraformer-arcgis-parser');
const Promise = require('bluebird');
const _ = require('lodash');

module.exports = function(options) {

    var networkDefault = {
        objectIdFieldName: "_id",
        globalIdFieldName: "",
        geometryType: "esriGeometryPoint",
        spatialReference: {
            wkid: 4326,
            latestWkid: 4326
        }
    };

    function tile(geometry) {

        return options.model.dataSource.connector.collection(options.geoModel).find({
                point: {
                    $geoIntersects: {
                        $geometry: {
                            type: "Polygon",
                            coordinates: [
                                [
                                    [geometry.xmin, geometry.ymin],
                                    [geometry.xmin, geometry.ymax],
                                    [geometry.xmax, geometry.ymax],
                                    [geometry.xmax, geometry.ymin],
                                    [geometry.xmin, geometry.ymin]
                                ]
                            ]
                        }
                    }
                }
            })
            .toArray()
            .then(function(locations) {

                return Promise.map(locations, function(location) {

                    var feature = {
                        type: "Feature",
                        geometry: location.point,
                        properties: location
                    };
                    return ArcGIS.convert(feature, {
                        idAttribute: '_id'
                    });
                });
            })
            .then(function(features) {
                return _.extend({
                    features: features
                }, networkDefault);
            });

    }

    return tile;

};
