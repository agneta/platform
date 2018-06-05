/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/lib/gis/local-tiles.js
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
const ArcGIS = require('terraformer-arcgis-parser');
const Promise = require('bluebird');
const _ = require('lodash');

module.exports = function(options) {

  var networkDefault = {
    objectIdFieldName: '_id',
    globalIdFieldName: '',
    geometryType: 'esriGeometryPoint',
    spatialReference: {
      wkid: 4326,
      latestWkid: 4326
    }
  };

  function tile(geometry) {

    return options.model.getCollection(options.geoModel).find({
      point: {
        $geoIntersects: {
          $geometry: {
            type: 'Polygon',
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
            type: 'Feature',
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
