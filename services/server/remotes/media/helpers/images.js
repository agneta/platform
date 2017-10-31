/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/server/remotes/media/helpers/images.js
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
const path = require('path');
const _ = require('lodash');
const gm = require('gm');

module.exports = function(Model, app) {

  var sizes = app.get('media').sizes;
  var sizeKeys = _.keys(sizes);

  Model.__images = {};

  Model.__images.onUpload = function(options, operations) {

    return _.map(sizeKeys, function(key) {

      var size = sizes[key];

      var transformer = gm(options.file);

      if (size.crop) {
        transformer = transformer.thumbnail(size.width, size.height+'^');
        transformer = transformer.gravity('center');
      } else {
        transformer = transformer.resize(size.width, size.height);
      }

      var parsed = path.parse(options.location);
      parsed.base += '/' + key;
      var location = path.format(parsed);

      operations.push({
        file: transformer.stream(),
        location: location,
        mimetype: options.mimetype,
        type: options.type,
        isSize: true
      });

    });

  };

  Model.__images.onUpdate = function(options) {

    if (options.file.type == 'image') {
      for (var key in sizes) {
        options.operations.push({
          source: path.join(options.file.location, key),
          target: path.join(options.target, key)
        });
      }
    }

  };


  Model.__images.onSaveBefore = function(ctx) {

    var instance = ctx.currentInstance || ctx.instance;
    var data = ctx.data || ctx.instance;

    return Promise.resolve()
      .then(function() {

        if (!instance.location) {
          console.error(ctx);
          throw new Error('No location found');
        }

        var locationParts = instance.location.split('/');
        locationParts.pop();
        var originalLocation = locationParts.join('/');
        if (!instance.isSize && sizes[instance.name]) {
          return Model.findOne({
            where: {
              location: originalLocation
            },
            fields: {
              type: true
            }
          })
            .then(function(object) {
              if (object && object.type == 'image') {
                data.isSize = true;
              } else {
                data.isSize = false;
              }
              //console.log('isSize', instance.location, data.isSize);
            });
        } else {
          data.isSize = false;
        }

      });

  };

  Model.__images.onSaveAfter = function(instance) {
    if (instance.type == 'image' && !instance.isSize) {

      return Promise.map(sizeKeys, function(sizeKey) {
        var sizeLocation = path.join(instance.location, sizeKey);
        return Model.findOne({
          where: {
            location: sizeLocation
          }
        })
          .then(function(object) {
            if (object) {
              return object.updateAttribute('updatedAt', instance.updatedAt);
            }
          });
      });
    }

    return Promise.resolve();
  };

  Model.__images.onDelete = function(options) {

    if (options.file.type == 'image') {

      for (var key in sizes) {
        options.files.push({
          Key: options.location + '/' + key
        });
      }
    }

  };

};
