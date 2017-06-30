module.exports = function(locals) {

    var project = locals.project;

    function jsHelper() {
        /* jshint validthis: true */
        var result = '';
        var path = '';

        for (var i = 0, len = arguments.length; i < len; i++) {
            path = arguments[i];

            if (i) result += '\n';

            if (Array.isArray(path)) {
                result += jsHelper.apply(this, path);
            } else {
                if (path.substring(path.length - 3, path.length) !== '.js') path += '.js';
                result += '<script src="' + this.get_asset(path) + '" type="text/javascript"></script>';
            }
        }

        return result;
    }

    project.extend.helper.register('js', jsHelper);

};
