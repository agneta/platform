var _ = require('lodash');
var path = require('path');
var fs = require('fs');
var url = require('url');
var urljoin = require('url-join');
var yaml = require('js-yaml');

module.exports = function(app, options) {
    options = options || {};
    var env = app.get('env');
    app.set('env', options.env || process.env.NODE_ENV || env);
    var baseDir = options.dir || process.env.PROJECT_DIR || process.cwd();

    app.set('website_dir', path.join(baseDir, 'website'));
    app.set('services_dir', path.join(baseDir, 'services'));
    app.set('options', options);

    if (options.include && !_.isArray(options.include)) {
        options.include = [options.include];
    }

    app.set('services_include', options.include || []);
    app.set('root', options.root);

    var configurator = require('./configurator')(app);
    var config = configurator.load('config');

    for (var key in config) {
        var data = config[key];
        var source = app.get(key);
        if (source && _.isObject(source)) {
            data = _.extend(source, data);
        }
        app.set(key, data);
    }

    //

    var webOpts = options.website || {};
    var website = {
        host: webOpts.host || app.get('web_url') || process.env.WEBSITE,
        root: webOpts.root
    };

    website.url = urljoin(website.host, website.root);
    //console.log('services:url_web',website.url);

    app.set('website', website);

    /////

    var allowOrigins = [
        website.host
    ];

    app.set('allowOrigins', allowOrigins);

    ////////////////

    var db = app.get('db');
    var user = '';
    var ssl = '';

    if (!db.host || !db.database) {
        console.error(db);
        throw "Missing database configurations...";
    }

    if (db.username) {
        user = db.username + ':' + db.password + '@';
    }
    if (db.ssl) {
        ssl = '?ssl=true';
    }

    db.url = 'mongodb://' + user + db.host + ':' + db.port + '/' + db.database + ssl;
    //console.log('Mongod URL: "' + db.url + '"');
    //console.log('Website is:', app.get('website'));

};
