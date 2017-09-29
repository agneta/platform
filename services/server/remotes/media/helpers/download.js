const path = require('path');

module.exports = function(Model, app) {

  var bucket = app.get('storage').buckets.media;

  Model.__download = function(location,req) {

    location = path.normalize(location);
    location = app.helpers.normalizePath(location);

    var item;

    return Promise.resolve()
      .then(function() {

        //return app.storage.headObject(params);
        return Model.findOne({
          where: {
            location: location
          }
        });

      })
      .then(function(_item) {

        item = _item;

        if (!item) {
          return Promise.reject({
            message: 'Media file could not be found'
          });
        }

        var roles = ['administrator', 'editor'];

        if (item.roles) {
          roles = roles.concat(item.roles);
        }

        return app.models.Account.hasRoles(
          roles,
          req
        );

      })
      .then(function(result) {
        if (!result.has) {
          //console.log(result);
          return Promise.reject({
            status: '401',
            message: 'You are not authorized to access this media object'
          });
        }
      })
      .then(function() {

        item.stream = app.storage.getObjectStream({
          Bucket: bucket.private,
          Key: location
        });

        return item;

      });

  };
};
