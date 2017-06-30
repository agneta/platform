var url = require('url');
var nPath = require('path');
var urljoin = require('url-join');
var _ = require('lodash');

module.exports = function(locals) {

    var project = locals.project;

    function urlForHelper(path, options) {

        path = path || '/';

        var config = this.config;
        var root = config.root;
        var data = url.parse(path);

        options = _.assign({
            relative: config.relative_link
        }, options);

        // Exit if this is an external path
        if (data.protocol || path.substring(0, 2) === '//') {
            return path;
        }

        // Resolve relative url
        if (options.relative) {
            return this.relative_url(this.path, path);
        }
        path = nPath.normalize('/' + urljoin(root, path));

        return path;
    }

    project.extend.helper.register('url_for', urlForHelper);

};
