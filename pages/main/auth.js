/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/main/auth.js
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
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
