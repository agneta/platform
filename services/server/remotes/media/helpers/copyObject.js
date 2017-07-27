const urljoin = require('url-join');
const Promise = require('bluebird');
const path = require('path');
const _ = require('lodash');

module.exports = function(Model, app) {

  Model.__copyObject = function(operation) {

    var object;

    operation.source = app.helpers.normalizePath(operation.source);
    operation.target = app.helpers.normalizePath(operation.target);

    return app.storage.copyObject({
      Bucket: Model.__bucket.name,
      CopySource: urljoin(Model.__bucket.name, operation.source),
      Key: operation.target,
      ContentType: operation.contentType
    })
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

        object = _object;
        var parsedLocation = path.parse(operation.target);
        return Model.__checkFolders({
          dir: parsedLocation.dir
        });

      })
      .then(function() {
        return object;
      });
  };

};
