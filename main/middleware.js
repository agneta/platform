var start = require('./start');
var log = require('./log');
var Promise = require('bluebird');

module.exports = function(options) {

    var app = options.mainApp;
    var name = options.name || options.root;
    var url = '/' + options.root;

    var title = options.title || name;
    options.url_services = options.url_services || '/';

    var component = start[name](options);
    var componentApp = component.locals.app;

    var appName = name;

    if (options.id) {
        appName += '_' + options.id;
    }

    componentApp.set('name', appName);
    componentApp.set('title', title);

    function init() {
        console.log('URL:', url);
        app.use(url, componentApp);

        if (component.init) {
            return component.init()
                .then(function() {
                    return component.locals;
                });
        }

        return component.locals;
    }

    return {
        init: init,
        start: component.start,
        locals: component.locals
    };
};
