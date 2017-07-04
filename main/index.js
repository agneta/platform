require('sharp');

const _ = require('lodash');
const cluster = require('cluster');
const express = require('express');
const config = require('./config');
const sticky = require('sticky-session');

var workers = process.env.WEB_CONCURRENCY;

cluster.on('online', function(worker) {
    console.log('worker is online', worker.id);
    console.log('workers', _.size(cluster.workers));
});

//-------------------------------------------------

var app = express();
var port = config.port;
var server = require('http').createServer(app);


//-------------------------------------------------

if (sticky.listen(server, port, {
        workers: workers
    })) {
    start();
    return;
}

server.once('listening', function() {
    console.log('----------------------------------');
    console.log('Listening to port: ', port);
    console.log('----------------------------------');
});


function start() {

    var worker;
    switch (process.env.MODE) {
        case 'services':
            worker = require('./server/services');
            break;
        default:
            worker = require('./server/portal');
            break;
    }

    worker({
        server: server,
        app: app
    });

}
