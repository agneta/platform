var path = require('path');
var url = require('url');
var _ = require('lodash');
var S = require('string');
var fs = require('fs');
var urljoin = require('url-join');

module.exports = function(locals) {

    var project = locals.project;

    project.extend.helper.register('asset_page', function(assetPath, page) {
        page = page || this.page;
        assetPath = urljoin(this.pagePath(page), assetPath);
        return this.get_asset(assetPath);
    });

    project.extend.helper.register('asset_files', function(path_target) {
        var path_dir = path.join(project.paths.source, path_target);
        return fs.readdirSync(path_dir);
    });

    project.extend.helper.register('asset_path', function(data) {
        return this.sourcePath(data);
    });

    project.extend.helper.register('get_asset', function(path_check) {

        if (_.isObject(path_check)) {
            if (path_check.services) {
                return urljoin(project.site.url_services, path_check.services);
            }
        }

        if (url.parse(path_check).protocol) {
            return path_check;
        }

        if (path_check.indexOf('//') === 0) {
            return project.site.protocol + path_check;
        }

        var tmp = this.sourcePath(path_check).split('/');

        if (tmp[0] == 'lib') {
            tmp.shift();
            return this.get_lib(tmp.join('/'));
        }

        var stat = this.has_file(path_check);
        if (!stat) {
            throw new Error('Asset does not exist: ' + path_check);
        }

        if (tmp[0] == 'views') {
            tmp.shift();
        }

        var result = tmp.join('/');

        result = this.getVersion(result);
        result = this.url_for(result);

        return result;
    });

};
