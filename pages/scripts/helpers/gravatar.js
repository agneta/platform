
var crypto = require('crypto');
var querystring = require('querystring');

module.exports = function(locals) {

    var project = locals.project;

    function md5(str) {
        return crypto.createHash('md5').update(str).digest('hex');
    }

    function gravatarHelper(email, options) {
        if (typeof options === 'number') {
            options = {
                s: options
            };
        }

        var str = 'http://www.gravatar.com/avatar/' + md5(email.toLowerCase());
        var qs = querystring.stringify(options);

        if (qs) str += '?' + qs;

        return str;
    }

    project.extend.helper.register('gravatar', gravatarHelper);

};
