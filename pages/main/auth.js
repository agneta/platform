var auth = require('basic-auth');
var session = require('express-session');
var bcrypt = require("bcryptjs");

module.exports = function(locals) {

    var app = locals.app;
    var project = locals.project;

    app.use(session({
        secret: 'i86rvbI86VI86*^rvi86RVBI*^r8V',
        resave: false,
        saveUninitialized: false
    }));

    if (project.config.auth) {

        app.use(function(req, res, next) {

            var credentials = auth(req);

            if (req.session && req.session.admin) {
                return next();
            }


            var user;

            if (credentials) {
                user = project.config.auth[credentials.name];
            }

            if (!credentials ||
                !user ||
                !bcrypt.compareSync(credentials.pass, user.pass)
            ) {

                res.statusCode = 401;
                res.setHeader('WWW-Authenticate', 'Basic realm="example"');
                return res.end('Access denied');


            }

            if (credentials && user && bcrypt.compareSync(credentials.pass, user.pass)) {

                req.session.user = credentials.name;
                req.session.admin = true;

            }

            next();
        });

    }

}
