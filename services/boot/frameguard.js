const _ = require('lodash');
const url = require('url');
module.exports = function(app){

  var config = app.get('frameguard');
  var allowOrigin = _.zipObject(config.allow, _.map(config.allow, function() {
    return true;
  }));

  var allowHost = _.zipObject(_.map(config.allow, function(origin) {
    return url.parse(origin).host;
  }),config.allow);

  //console.log(allowHost);

  app.frameguard = function(req) {

    var value = 'SAMEORIGIN';

    if(config){

      var origin = req.get('origin');
      if(allowOrigin[origin]){
        value = `ALLOW-FROM ${origin}`;
      }

      var host = req.get('host');
      if(allowHost[host]){
        value = `ALLOW-FROM ${allowHost[host]}`;
      }

      //console.log('frameguard.origin',origin,host);
    }

    return value;

  };

};
