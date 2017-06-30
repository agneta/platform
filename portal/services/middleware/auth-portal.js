var urljoin = require('url-join');
var request = require('request');

module.exports = function(app) {

    var apiAllow = urljoin(app.get('restApiRoot'), 'accounts');
    var website = app.get('website').host;

    return function(req, res, next) {

        var reqPath = req.path.toLowerCase();
        var urlParts = reqPath.split('/');

        switch(reqPath){
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

        if (urlParts[2] == 'partial') {
            return next();
        }

        if (
            urlParts[1] == 'preview' &&
            urlParts[2] == 'real-time' &&
            urlParts[4] == 'partial'
        ) {
            return next();
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
