/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/boot/frameguard.js
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
const _ = require('lodash');
const url = require('url');
module.exports = function(app){

  var config = app.web.services.get('frameguard');
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
