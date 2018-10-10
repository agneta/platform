/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/models/media/helpers/updateFile.js
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
const urljoin = require('url-join');
const _ = require('lodash');

module.exports = function(Model, app) {
  var rolesConfig = app.get('roles');
  var types = {
    public: true,
    private: true
  };

  Model.__updateFile = function(options) {
    var id = options.id;
    var location = options.location;
    var dir = options.dir || path.parse(location).dir;
    var name = options.name || path.parse(location).name;
    var contentType = options.contentType;
    var privacy = (options.privacy = options.privacy || {});

    var operations;
    var file;
    var target;

    return Promise.resolve()
      .then(function() {
        privacy.roles = _.uniq(privacy.roles || []);
        privacy.roles.map(function(roleName) {
          var role = rolesConfig[roleName];
          if (!role) {
            return Promise.reject({
              statusCode: 400,
              message: `Role does not exist ${roleName}`
            });
          }
        });

        privacy.type = privacy.type || 'private';

        if (!types[privacy.type]) {
          return Promise.reject({
            statusCode: 400,
            message: `Incorrect type: ${privacy.type}`
          });
        }
      })
      .then(function() {
        if (id) {
          return Model.findById(id);
        }
        if (location) {
          return Model.findOne({
            where: {
              location: location
            }
          });
        }
        return Promise.reject({
          message: 'Must give at leat an id or a location'
        });
      })
      .then(function(_file) {
        file = _file;

        //console.log('media:updateFile:item',file);

        if (!file) {
          return Promise.reject({
            message: 'File not found'
          });
        }

        name = name || file.name;
        target = options.target || urljoin(dir, name);

        //console.log('media:updateFile:dir',dir);
        //console.log('media:updateFile:target',target);

        operations = [
          {
            source: file.location,
            target: target
          }
        ];

        if (file.type == 'folder') {
          return Model._list({
            dir: file.location
          }).then(function(result) {
            return Promise.map(
              result.objects,
              function(object) {
                var childDir = object.location.replace(file.location, target);
                childDir = path.normalize(childDir);
                childDir = childDir.split('/');
                childDir.pop();
                childDir = childDir.join('/');

                var childOptions = _.extend({}, options, {
                  id: object.id,
                  location: null,
                  target: null,
                  dir: childDir,
                  name: object.name
                });

                return Model.__updateFile(childOptions);
              },
              {
                concurrency: 6
              }
            );
          });
        }

        Model.__images.onUpdate({
          file: file,
          target: target,
          operations: operations
        });
      })
      .then(function() {
        if (!operations) {
          return file;
        }

        return Promise.map(operations, function(operation) {
          return Promise.resolve()
            .then(function() {
              operation.contentType = contentType;
              operation.object = file;

              operation.source = app.helpers.normalizePath(operation.source);
              operation.target = app.helpers.normalizePath(operation.target);

              if (operation.source == operation.target) {
                return;
              }

              if (options.copy) {
                return Model.__copyObject(operation);
              }
              //console.log('media:updateFile:moveObject:operation',operation);
              return Model.__moveObject(operation);
            })
            .then(function(object) {
              if (!object) {
                return Model.findOne({
                  where: {
                    location: operation.target
                  }
                });
              }

              return object;
            })
            .then(function(object) {
              if (!object) {
                return Promise.reject({
                  statusCode: 400,
                  message: `Could not find object with target ${
                    operation.target
                  }`
                });
              }

              var attrs = _.pick(options, ['privacy']);

              if (_.size(attrs)) {
                return object.patchAttributes(attrs);
              }
              return object;
            });
        }).then(function(objects) {
          //console.log('On updated', objects);
          var object = _.find(objects, {
            location: target
          });

          Model.__prepareObject(object);
          return {
            _success: 'Object was updated',
            file: object
          };
        });
      });
  };
};
