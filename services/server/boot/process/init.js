const Promise = require('bluebird');
const publicIp = require('public-ip');


module.exports = function(app) {

  var props = {
    host: process.env.HOST_NAME,
    env: process.env.NODE_ENV,
    mode: process.env.MODE
  };

  return Promise.map(['v4'/*, 'v6'*/], function(method) {
    return publicIp[method]()
      .then(function(ip) {
        props[`ip${method}`] = ip;
      });
  })
    .then(function() {
      console.log(props);
      return app.models.Process.find();
    });

};
