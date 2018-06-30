import { URLFormatOptions } from 'url';

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

//--------------------------------------------

const url = require('url');
const Promise = require('bluebird');
const path = require('path');
const paths = require('../paths');
const config = require('../config');

//---------------------------------------------------
// Look for server certificates
interface ProtocolOptions {
  key?: string;
  cert?: string;
  ca?: string;
  requestCert?: boolean;
  rejectUnauthorized?: boolean;
}
interface ServerOptions {
  protocolOptions?: ProtocolOptions;
}

var options: ServerOptions = {};
var protocol = 'http';
var port = '443';

module.exports = Promise.resolve()
  .then(function() {
    require('./version')();
  })
  .then(function() {
    var secrets = require(path.join(paths.core.services, 'lib/secrets'))({});

    var serverKey = secrets.get('keys.server.key');
    var serverCert = secrets.get('keys.server.cert');

    if (!serverKey || !serverCert) {
      return;
    }

    var protocolOptions = {
      key: serverKey,
      cert: serverCert,
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

    process.env.SERVER_NAME =
      process.env.SERVER_NAME || config.agneta.get('server.name');

    process.env.HOST_NAME = process.env.HOST_NAME || 'localhost';
    process.env.PORT = process.env.PORT || port;
    process.env.PORT_HTTP = process.env.PORT_HTTP || '80';
    process.env.MODE = process.env.MODE || 'portal';

    if (!process.env.ENDPOINT) {
      let options: any = {
        protocol: protocol,
        hostname: process.env.HOST_NAME
      };
      if (process.env.HOST_NAME == 'localhost') {
        options.port = process.env.PORT;
      }
      url.format;
      process.env.ENDPOINT = url.format(options);
    }

    process.env.NODE_ENV = process.env.NODE_ENV || 'development';
    process.env.PROTOCOL = protocol;
  })
  .then(function() {
    var server;

    console.log('MODE', process.env.MODE);

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
  .catch(function(err: Error) {
    console.error(err);
  });
