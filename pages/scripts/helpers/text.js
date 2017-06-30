var md5 = require('md5');

module.exports = function(locals) {

    var project = locals.project;

    /////////////////////////////////////////////////////////////////
    // Truncate text at length and add three dots (...)
    /////////////////////////////////////////////////////////////////

    project.extend.helper.register('slice_text', function(str, len) {
        if (str.length > len) {
            str = str.slice(0, len);
        }
        str += '...';
        return str;
    });

    /////////////////////////////////////////////////////////////////
    // Capitalize first character in string
    /////////////////////////////////////////////////////////////////

    project.extend.helper.register('capitalize_first', function(string) {
        if (!string)
            return;
        return string.charAt(0).toUpperCase() + string.slice(1);
    });

    project.extend.helper.register('md5', function(string) {
        return md5(message);
    });

}
