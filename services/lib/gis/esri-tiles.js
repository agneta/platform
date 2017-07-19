/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/lib/gis/esri-tiles.js
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
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

    function tile(geometry) {

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
                return app.gis.esri.query(query);

            });


    }

    return tile;

};
