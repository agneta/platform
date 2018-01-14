const _ = require('lodash');
const url = require('url');
module.exports = function(app){

  var config = app.get('frameguard');
  var allowOrigin;
  var allowHost;

  if(config){
    allowOrigin = _.zipObject(config.allow, _.map(config.allow, function() {
      return true;
    }));
    allowHost = _.zipObject(_.map(config.allow, function(origin) {
      return url.parse(origin).host;
    }),config.allow);
  }else{
    allowOrigin = {};
    allowHost = {};
  }

  //console.log(allowHost);

  app.frameguard = function(options) {

    var req = options.req;
    var res = options.res;
    var headers = options.headers;

    var value;

    if(config){

      var origin = req.get('origin');
      if(allowOrigin[origin]){
        value = origin;
      }

      if(!value){
        var referer = req.get('referer');
        var host = referer?url.parse(referer).host:req.get('host');
        if(allowHost[host]){
          value = allowHost[host];
        }
      }

      //console.log('frameguard.origin',origin,host);
    }

    var _headers = [
      {
        name: 'X-Frame-Options',
        value: value?`ALLOW-FROM ${value}`:'SAMEORIGIN'
      },
      {
        name: 'Content-Security-Policy',
        value: `frame-ancestors ${value||'self'}`
      }
    ];

    for(var _header of _headers){
      if(headers){
        headers[_header.name] = _header.value;
      }
      if(res){
        res.setHeader(_header.name,_header.value);
      }

    }

  };

};
