module.exports = function(Model, app) {
  Model.__get = function(options) {
    return Promise.resolve().then(function() {
      var promise;
      var id = options.id;
      var location = options.location;
      if (id) {
        promise = Model.findById(id, {
          fields: options.fields
        });
      }

      if (location) {
        promise = Model.findOne({
          where: {
            location: app.helpers.normalizePath(location)
          },
          fields: options.fields
        });
      }

      if (!promise) {
        throw new Error('Must provide the file id or location');
      }

      return promise;
    });
  };

  Model.get = function(options) {
    return Model.__get(options).then(function(object) {
      if (!object) {
        return Promise.reject({
          statusCode: 400,
          message: 'Media file not found'
        });
      }

      return object;
    });
  };
};
