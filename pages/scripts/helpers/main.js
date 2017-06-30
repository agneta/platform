var fs = require('fs');
var path = require('path');
var url = require('url');
var _ = require('lodash');
var urljoin = require('url-join');
var yaml = require('js-yaml');

module.exports = function(locals) {

    var project = locals.project;

    /////////////////////////////////////////////////////
    //
    /////////////////////////////////////////////////////

    project.extend.helper.register('get_name', function(page) {
        var arr = page.slug.split('/');
        return arr[arr.length - 1];
    });

    /////////////////////////////////////////////////////
    //
    /////////////////////////////////////////////////////


    project.extend.helper.register('url_join', urljoin);

    ////////////////////////////////////////////////
    // GET VALUE BASED ON LIVE OR PREVIEW
    ////////////////////////////////////////////////


    project.extend.helper.register('get_env',function(obj) {

        var res = obj[locals.env];

        if (!res) {
            console.error(
                'Could not find environment value',
                locals.env,
                'of',
                obj);

            throw new Error('Could not find environment value');
        }

        return res;
    });

    /////////////////////////////////////////////////////
    //
    /////////////////////////////////////////////////////

    project.extend.helper.register('isActive', function(item) {
        var a = item.pathSource || item.path || item;
        var b = this.page.pathSource || this.page.path;
        return a == b;
    });


    /////////////////////////////////////////////////////////////////
    //
    /////////////////////////////////////////////////////////////////

    project.extend.helper.register('has_source', function(target) {
        return this.is_file(path.join(project.paths.base, 'source', target));
    });

    project.extend.helper.register('is_file', function(path_check) {
        try {
            fs.statSync(path_check);
            return true;
        } catch (err) {
            return false;
        }
    });

};
