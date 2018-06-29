const Promise = require('bluebird');

module.exports = function(Model) {
  Model.__images.onSaveBefore = function(ctx) {
    var instance = ctx.currentInstance || ctx.instance;
    var data = ctx.data || ctx.instance;

    return Promise.resolve().then(function() {
      if (!instance.location) {
        console.error(ctx);
        throw new Error('No location found');
      }

      var locationParts = instance.location.split('/');
      locationParts.pop();
      var originalLocation = locationParts.join('/');
      if (!instance.isSize && Model.__images.sizes[instance.name]) {
        return Model.findOne({
          where: {
            location: originalLocation
          },
          fields: {
            type: true
          }
        }).then(function(object) {
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
};
