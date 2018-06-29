const path = require('path');
const _ = require('lodash');
const gm = require('gm');

module.exports = function(Model) {
  Model.__images.onUpload = function(options, operations) {
    return _.map(Model.__images.sizeKeys, function(key) {
      var size = Model.__images.sizes[key];

      var transformer = gm(options.file, options.filename);

      if (size.crop) {
        transformer = transformer.thumbnail(size.width, size.height + '^');
        transformer = transformer.gravity('center');
      } else {
        transformer = transformer.resize(size.width, size.height);
      }

      transformer = transformer.noProfile();

      var parsed = path.parse(options.location);
      parsed.base += '/' + key;
      var location = path.format(parsed);

      operations.push(
        _.extend({}, options, {
          file: transformer.stream(),
          location: location,
          isSize: true
        })
      );
    });
  };
};
