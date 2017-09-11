module.exports = function(app) {

  var config = app.get('certificate');

  return function(req, res, next) {

    var cert = req.socket.getPeerCertificate();
    console.log(cert);

    next();

  };

};
