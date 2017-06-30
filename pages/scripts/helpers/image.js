module.exports = function(locals) {

    var project = locals.project;

    //////////////////////////////////////////////////////////////
    // Get width and height of an image
    //////////////////////////////////////////////////////////////

    var sizeOf = require('image-size');
    var path = require('path');

    project.extend.helper.register('image_size', function(url) {
        var image_path = path.join(project.paths.source, url);
        return sizeOf(image_path);
    });

}