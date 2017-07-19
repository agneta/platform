/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/lib/gis.js
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

module.exports = function(app) {

    app.gis = {
        remoteNetwork: function(options) {

            options = options || {};

            var Model = options.model;
            var name = options.name;
            options.geoModel = options.geoModel || Model.definition.name;

            var sources = {
                local: require('./gis/local-tiles')(options),
                esri: require('./gis/esri-tiles')(app, options)
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
