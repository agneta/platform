const Promise = require('bluebird');
const path = require('path');
const urljoin = require('url-join');
const _ = require('lodash');

module.exports = function(Model, app) {

  var rolesConfig = app.get('roles');

  Model.__updateFile = function(options) {
    console.log('options',options);
    var id = options.id;
    var location = options.location;
    var dir = options.dir;
    var name = options.name;
    var contentType = options.contentType;
    var roles = options.roles;

    var operations;
    var file;
    var target;

    return Promise.resolve()
      .then(function() {

        if (!roles) {
          return;
        }

        roles = _.uniq(roles);

        return Promise.map(roles, function(roleName) {
          var role = rolesConfig[roleName];
          if (!role) {
            return Promise.reject({
              statusCode: 400,
              message: `Role does not exist ${roleName}`
            });
          }
        });
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

        if (!file) {
          return Promise.reject({
            message: 'File not found'
          });
        }

        name = name || file.name;

        if (dir) {
          target = urljoin(dir, name);
          return;
        }

        target = options.target || target;

        if (!target) {
          return;
        }


        operations = [{
          source: file.location,
          target: target
        }];

        if (file.type == 'folder') {
          return Model._list(file.location)
            .then(function(result) {
              return Promise.map(result.objects, function(object) {

                var childDir = object.location.replace(file.location, target);
                childDir = path.normalize(childDir);
                childDir = childDir.split('/');
                childDir.pop();
                childDir = childDir.join('/');

                return Model.__updateFile(
                  _.extend({},options,{
                    id: object.id,
                    location: null,
                    target: null,
                    dir: childDir,
                    name: object.name
                  })
                );
              }, {
                concurrency: 6
              });
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

          operation.contentType = contentType;

          if (options.copy) {
            console.log('operation',operation);
            return Model.__copyObject(operation);
          }

          return Model.__moveObject(operation);
        })
          .then(function() {

            var attrs = {};

            if (contentType) {
              attrs.contentType = contentType;
              attrs.type = app.helpers.mediaType(contentType);
            }
            attrs.location = target;
            attrs.name = name;
            if (roles) {
              attrs.roles = roles;
            }

            if (options.copy) {

              var props = _.extend({}, file.__data, attrs);
              props = _.omit(props,['id']);

              console.log('props',props);

              return Model.findOrCreate({
                where: {
                  location: props.location
                }
              }, props)
                .then(function(result) {
                  if (result[1]) {
                    //created
                    return;
                  }

                  return result[0].updateAttributes(props);


                });
            }
            return file.updateAttributes(attrs);

          })
          .then(function(object) {
            Model.__prepareObject(object);
            return {
              _success: 'Object was updated',
              file: object
            };
          });
      });


  };
};
