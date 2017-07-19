/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/middleware/auth-portal.js
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
var urljoin = require('url-join');
var request = require('request');

module.exports = function(app) {

    var apiAllow = urljoin(app.get('restApiRoot'), 'accounts');
    var website = app.get('website').host;

    return function(req, res, next) {

        var reqPath = req.path.toLowerCase();
        var urlParts = reqPath.split('/');

        switch (reqPath) {
            case '/private/page/en/login/view/':
            case '/private/page/en/login/view-data/':
            case '/main/compatibility.js':
            case '/generated/services.js':
            case '/images/backgrounds/green-field.jpg':
            case '/login.css':
            case '/theme.css':
            case '/style.css':
            case '/main.js':
            case '/main/account.js':
            case '/main/socket.js':
            case '/main/portal.js':
            case '/main/interceptors.js':
            case '/portal/main.js':
                return next();
        }

        if (reqPath.indexOf(apiAllow) === 0) {
            return next();
        }

        if (reqPath.indexOf('/private/page/en/partial/') === 0) {
            return next();
        }

        if (urlParts[2] == 'login') {

        }

        if (urlParts[2] == 'login') {
            return next();
        }

        if (req.accessToken) {
            return next();
        }
        var url = urljoin(website, 'en/login');
        req.url = url;
        req.pipe(request(url)).pipe(res);

    };

};
