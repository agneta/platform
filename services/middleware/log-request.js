/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/middleware/log-request.js
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
var _ = require('lodash');

////////////////////////////////////////////////////////////////////////
//  Log Request
////////////////////////////////////////////////////////////////////////

module.exports = function(token) {

  var hideMap = {
    password_new: '***********',
    password_old: '***********',
    password: '***********',
  };

  hideMap[token.name] = '***************';


  return function(req, res, next) {

    var params = {};
    switch (req.method) {
      case 'GET':
        params = req.query;
        break;
      case 'POST':
        params = req.body;
        break;
    }

    params = _.extend({},params);

    for(var key in params){
      var value = hideMap[key];
      if(value){
        params[key] = value;
      }
    }

    var data = {
      hostname: req.hostname,
      ip: req.ip || req.connection.remoteAddress,
      agent: req.headers['user-agent'],
      method: req.method,
      params: params,
      path: req.path,
      protocol: req.protocol,
    };

    req.dataParsed = data;

    next();
  };
};
