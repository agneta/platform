require('sharp');

const cluster = require('cluster');
const express = require('express');
const loopback = require('loopback');
const config = require('./config');
const clusterManager = require('./cluster-manager');
const chalk = require('chalk');
const http = require('http');
const socketio = require('socket.io');

var workerCount = process.env.WEB_CONCURRENCY;
var port = config.port;
//-------------------------------------------------

if (cluster.isMaster) {

    var server = http.createServer(),
        socketIO = socketio.listen(server),
        redis = require('socket.io-redis');


    clusterManager(workerCount);
    return;
}

//-------------------------------------------------

var worker;
var app;

switch (process.env.MODE) {
    case 'services':
        app = loopback();
        worker = require('./server/services');
        break;
    default:
        app = express();
        worker = require('./server/portal');
        break;
}

//--------------------------------

var log = console.log;

console.log = function() {
    var args = Array.prototype.slice.call(arguments);
    log.apply(console, [chalk.cyan(`[worker:${cluster.worker.id}]`)].concat(args));
};

//--------------------------------

process.on('message', function(msg) {
    if (msg.exit) {
        process.exit();
    }
});

//--------------------------------

var server = http.createServer(app);

var sockets = socketio(server);
app.sockets = sockets;

worker({
        server: server,
        app: app
    })
    .then(function() {
        app.listen(port, function(err) {
            if (err) {
                throw new Error(err);
            }
            console.log(chalk.bold.green('Application is available'));
            process.send({
                started: true
            });

        });
    });
