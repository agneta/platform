module.exports = function(Model) {
  Model.__images.onDelete = function(options) {
    if (options.file.type == 'image') {
      for (var key in Model.__images.sizes) {
        options.files.push({
          Key: options.location + '/' + key
        });
      }
    }
  };
};
