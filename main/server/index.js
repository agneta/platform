/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: main/server/index.js
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

//--------------------------------------------
// Extend lodash
var _ = require('lodash');
_.mixin(require('lodash-deep'));
_.omitDeep = function(collection, excludeKeys) {

  function omitFn(value) {

    if (value && typeof value === 'object') {
      excludeKeys.forEach((key) => {
        delete value[key];
      });
    }
  }

  return _.cloneDeepWith(collection, omitFn);

};

//--------------------------------------------


const url = require('url');
const Promise = require('bluebird');
const path = require('path');
const paths = require('../paths');
//---------------------------------------------------
// Look for server certificates

var options = {};
var protocol = 'http';
var port = 443;

module.exports = Promise.resolve()
  .then(function() {

    var secrets = require(
      path.join(paths.core.services,'lib/secrets')
    )({});

    var protocolOptions = {
      key: secrets.get('keys.server.key'),
      cert: secrets.get('keys.server.cert'),
      ca: secrets.get('keys.server.ca'),
      requestCert: true,
      rejectUnauthorized: false
    };
    //throw 'test';

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    options.protocolOptions = protocolOptions;

    protocol = 'https';

  })
  .then(function() {

    //---------------------------------------------------
    // Set environment variables

    process.env.HOST_NAME = process.env.HOST_NAME || 'localhost';
    process.env.PORT = process.env.PORT || port;
    process.env.PORT_HTTP = process.env.PORT_HTTP || 80;
    process.env.MODE = process.env.MODE || 'portal';

    process.env.ENDPOINT = process.env.ENDPOINT ||
      url.format({
        protocol: protocol,
        hostname: process.env.HOST_NAME
      });

    process.env.NODE_ENV = process.env.NODE_ENV || 'development';
    process.env.PROTOCOL = protocol;

  })
  .then(function() {

    var server;

    console.log('MODE',process.env.MODE);

    switch (process.env.MODE) {
      case 'sftp':
        server = require('./sftp');
        break;
      default:
        server = require('./cluster');
        break;
    }

    return server(options);

  })
  .catch(function(err) {
    console.error(err);
  });
