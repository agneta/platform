const path = require('path');

module.exports = function(Model) {
  Model.__images.onUpdate = function(options) {
    if (options.file.type == 'image') {
      for (var key in Model.__images.sizes) {
        options.operations.push({
          source: path.join(options.file.location, key),
          target: path.join(options.target, key)
        });
      }
    }
  };
};
