var config = require('./config');
var start = require('./start');

module.exports = function(app) {

    var options = {
        socket: {
            domain: config.host
        },
        scriptPath: function(path, port, options) {
            return config.host + '/browser-sync/browser-sync-client.js';
        },
        middleware: [
            app
        ],
        snippetOptions: {
            blacklist: ["**"]
        },
        ghostMode: {
            clicks: false,
            forms: false,
            scroll: false
        },
        browser: ["google chrome", "firefox", "iexplore"],
        ui: false,
        port: config.port,
        reloadDebounce: 1000,
        open: false,
        logFileChanges: false,
        logLevel: "silent"
    };

    start.browserSync.init(options);

    return new Promise(function(resolve) {
        start.browserSync.instance.events.once('init', resolve);
    });

}
