const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

module.exports = function(app, _options) {

    var secret = app.get("cookie_secret");
    var db = app.get("db");

    var sessionStore = app.sessionStore = new MongoStore({
        url: db.url,
        collection: 'Session',
        ttl: 8 * 60 * 60,
        autoRemove: 'native'
    });

    var options = {
        name: 'agneta_session',
        secret: secret,
        resave: false,
        saveUninitialized: false,
        store: sessionStore,
        cookie: {
            httpOnly: true,
            secure: true
        }
    };

    if (_options) {
        options.cookie.secure = _options.secure;
    }

    return session(options);

};
