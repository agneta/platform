/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/models/media/helpers/copyObject.js
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
const urljoin = require('url-join');
const Promise = require('bluebird');
const path = require('path');
const _ = require('lodash');

module.exports = function(Model, app) {

  Model.__copyObject = function(operation) {

    var object;

    operation.source = app.helpers.normalizePath(operation.source);
    operation.target = app.helpers.normalizePath(operation.target);

    if (operation.source == operation.target) {
      return Promise.resolve();
    }

    var storageOptions = {
      Bucket: Model.__bucket.name,
      CopySource: urljoin(Model.__bucket.name, operation.source),
      Key: operation.target,
      ContentType: operation.contentType
    };

    //console.log(storageOptions);

    return app.storage.copyObject(storageOptions)
      .catch(function(err) {

        if (err.message.indexOf('This copy request is illegal because it is trying to copy an object to itself') === 0) {
          return;
        }
        if (err.message.indexOf('The specified key does not exist') === 0) {
          return;
        }
        console.error(operation);
        return Promise.reject(err);
      })
      .then(function() {
        var attrs = {
          location: operation.target
        };

        if (operation.contentType) {
          attrs.contentType = operation.contentType;
          attrs.type = app.helpers.mediaType(operation.contentType);
        }

        attrs = _.extend({}, operation.object.__data, attrs);
        attrs = _.omit(attrs,['id']);

        //console.log('copy object:Model.findOrCreate',attrs);

        return Model.findOrCreate({
          where: {
            location: attrs.location
          }
        }, attrs)
          .then(function(result) {
            if (result[1]) {
              //created
              return result[0];
            }

            return result[0].patchAttributes(attrs);

          });
      })
      .then(function(_object) {

        //console.log('copied object',_object);

        object = _object;
        var parsedLocation = path.parse(operation.target);
        return Model.__checkFolders({
          dir: parsedLocation.dir
        });

      })
      .then(function() {
        //console.log('checked folders');

        return object;
      });
  };

};
