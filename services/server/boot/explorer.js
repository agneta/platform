var explorer = require('loopback-component-explorer');
var urljoin = require('url-join');

module.exports = function(app) {

    if (app.get('env') == 'production') {
        return;
    }

    var base;
    var root = app.get('root');
    var apiRoot = app.get("restApiRoot");

    base = urljoin(root, apiRoot);
    if (base[0] != '/') {
        base = '/' + base;
    }
    if (base[1] == '/') {
        base = base.substring(1);
    }

    app.use('/explorer', explorer.routes(app, {
        basePath: base
    }));
};
