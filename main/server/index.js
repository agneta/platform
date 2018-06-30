"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
var url = require('url');
var Promise = require('bluebird');
var path = require('path');
var paths = require('../paths');
var config = require('../config');
var options = {};
var protocol = 'http';
var port = '443';
module.exports = Promise.resolve()
    .then(function () {
    require('./version')();
})
    .then(function () {
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
    .then(function () {
    //---------------------------------------------------
    // Set environment variables
    process.env.SERVER_NAME =
        process.env.SERVER_NAME || config.agneta.get('server.name');
    process.env.HOST_NAME = process.env.HOST_NAME || 'localhost';
    process.env.PORT = process.env.PORT || port;
    process.env.PORT_HTTP = process.env.PORT_HTTP || '80';
    process.env.MODE = process.env.MODE || 'portal';
    if (!process.env.ENDPOINT) {
        var options_1 = {
            protocol: protocol,
            hostname: process.env.HOST_NAME
        };
        if (process.env.HOST_NAME == 'localhost') {
            options_1.port = process.env.PORT;
        }
        url.format;
        process.env.ENDPOINT = url.format(options_1);
    }
    process.env.NODE_ENV = process.env.NODE_ENV || 'development';
    process.env.PROTOCOL = protocol;
})
    .then(function () {
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
    .catch(function (err) {
    console.error(err);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBOzs7Ozs7Ozs7Ozs7Ozs7R0FlRztBQUVILDhDQUE4QztBQUM5QyxnQkFBZ0I7QUFDaEIsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzFCLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7QUFFaEMsOENBQThDO0FBRTlDLElBQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUMzQixJQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDcEMsSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzdCLElBQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNsQyxJQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7QUFlcEMsSUFBSSxPQUFPLEdBQWtCLEVBQUUsQ0FBQztBQUNoQyxJQUFJLFFBQVEsR0FBRyxNQUFNLENBQUM7QUFDdEIsSUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDO0FBRWpCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQU8sRUFBRTtLQUMvQixJQUFJLENBQUM7SUFDSixPQUFPLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQztBQUN6QixDQUFDLENBQUM7S0FDRCxJQUFJLENBQUM7SUFDSixJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxhQUFhLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBRXpFLElBQUksU0FBUyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUMvQyxJQUFJLFVBQVUs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