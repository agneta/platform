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
const getPort = require('get-port');

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

module.exports = Promise.resolve()
  .then(function() {
    require('./version')();
  })
  .then(function() {
    var app = {};
    require(path.join(paths.core.services, 'lib/configstore'))(app);
    var secrets = require(path.join(paths.core.services, 'lib/secrets'))(app);

    var serverKey = secrets.get('keys.server.key');
    var serverCert = secrets.get('keys.server.cert');

    if (!serverKey || !serverCert) {
      let selfsigned = require('selfsigned');
      let attrs = [{ name: 'commonName', value: 'agneta.io' }];
      let pems = selfsigned.generate(attrs, { days: 365 });

      serverKey = pems.private;
      serverCert = pems.cert;
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
  })
  .then(function() {
    return Promise.map(['PORT', 'PORT_HTTP'], setPort);

    function setPort(name: string) {
      let port = config.app[name.toLowerCase()] || process.env[name];
      port = parseInt(port);
      return getPort({
        port: port
      }).then(function(result) {
        if (result != port) {
          console.log(`${name}: ${port} was taken`);
        }
        process.env[name] = result;
      });
    }
  })
  .then(function() {
    //---------------------------------------------------
    // Set environment variables

    process.env.SERVER_NAME =
      process.env.SERVER_NAME || config.agneta.get('server.name');
    process.env.HOST_NAME = process.env.HOST_NAME || 'localhost';
    process.env.MODE = config.app.mode || process.env.MODE || 'portal';

    if (!process.env.ENDPOINT) {
      let options: any = {
        protocol: 'https',
        hostname: process.env.HOST_NAME
      };
      if (process.env.HOST_NAME == 'localhost') {
        options.port = process.env.PORT;
      }
      url.format;
      process.env.ENDPOINT = url.format(options);
    }

    process.env.NODE_ENV = process.env.NODE_ENV || 'development';
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
