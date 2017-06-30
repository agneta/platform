var path = require('path');

module.exports = function(locals) {

    var project = locals.project;

    /////////////////////////////////////////////////////////////////
    //
    /////////////////////////////////////////////////////////////////

    function layoutResource(options, config) {

        options = options || {};

        var _this = this;
        var template = options.template || this.page.template;
        var filePath = path.join(project.paths.source, template + config.ext);
        var exists = this.is_file(filePath);

        if (exists) {

            return getPath();

        } else {

            filePath = path.join(project.paths.sourceTheme, template + config.ext);
            exists = this.is_file(filePath);

            if (exists) {
                return getPath();
            }
        }

        function getPath() {

            var resPath = template + config.extOut;
            resPath = _this.get_asset(resPath);

            if (options.source) {
                return resPath;
            }

            return _this[config.type](resPath);
        }

    }

    /////////////////////////////////////////////////////////////////
    //
    /////////////////////////////////////////////////////////////////


    project.extend.helper.register('layout_style', function(options) {

        return layoutResource.call(this, options, {
            type: 'css',
            ext: '.styl',
            extOut: '.css'
        });

    });

    /////////////////////////////////////////////////////////////////
    //
    /////////////////////////////////////////////////////////////////

    project.extend.helper.register('layout_script', function(options) {

        return layoutResource.call(this, options, {
            type: 'js',
            ext: '.js',
            extOut: '.js'
        });

    });


}
