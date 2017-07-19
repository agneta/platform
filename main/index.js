/*
 * Copyright (c) 2017 Agneta Network Applications, LLC. All rights reserved.
 *
 * This library is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 */

require('sharp');

const os = require('os');
const config = require('./config');
const path = require('path');
const SocketCluster = require('socketcluster').SocketCluster;

//var workerCount = process.env.WEB_CONCURRENCY || 1;
// TODO: Make more stable the multiple workers

var workerCount = 1;
var port = config.port;

//-------------------------------------------------

workerCount = workerCount || os.cpus().length;
console.log(`Starting ${workerCount} workers`);

//-------------------------------------------------

var environment = process.env.NODE_ENV;

switch (environment) {
    case 'production':
        environment = 'prod';
        break;
    default:
        environment = 'dev';
        break;
}

var options = {
    workers: workerCount,
    port: port,
    path: config.socket.path,
    workerController: path.join(__dirname, 'cluster', 'worker'),
    environment: environment
};

var socketCluster = new SocketCluster(options);
require('./cluster/master').run(socketCluster);
