module.exports = function() {
    return function(req, res, next) {

      if (!req.secure) {
          var secureUrl = "https://" + req.headers.host + req.url;
          res.writeHead(301, {
              "Location": secureUrl
          });
          res.end();
          return;
      }
      next();
    };
};
