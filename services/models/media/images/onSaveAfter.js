const Promise = require('bluebird');
const path = require('path');

module.exports = function(Model) {
  Model.__images.onSaveAfter = function(instance) {
    if (instance.type == 'image' && !instance.isSize) {
      return Promise.map(Model.__images.sizeKeys, function(sizeKey) {
        var sizeLocation = path.join(instance.location, sizeKey);
        return Model.findOne({
          where: {
            location: sizeLocation
          }
        }).then(function(object) {
          if (object) {
            return object.updateAttribute('updatedAt', instance.updatedAt);
          }
        });
      });
    }
  };
};
