const Promise = require('bluebird');
const path = require('path');
const LRU = require('lru-cache');

module.exports = function(app) {
  app.media.album = function(options) {
    var cache = LRU();

    options.model.observe('before save', clearCache);
    options.model.observe('after delete', clearCache);

    function clearCache() {
      cache.reset();
      return Promise.resolve();
    }

    function getSize(image) {
      var location = path.join(image.location, 'extra_large');

      return app.models.Media.findOne({
        where: {
          location: location
        },
        fields: {
          image: true
        }
      }).then(function(data) {
        image.large = {
          width: data.image.width,
          height: data.image.height
        };
        return image;
      });
    }

    return {
      cache: cache,
      getSize: getSize
    };
  };
};
