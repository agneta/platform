require('sharp');

const _ = require('lodash');
const cluster = require('cluster');
const express = require('express');
const config = require('./config');
const sticky = require('sticky-session');
const chalk = require('chalk');

var workers = process.env.WEB_CONCURRENCY;
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

console.log('Running in environment: "' + app.get('env') + '"');
console.log();

server.once('listening', function() {
    console.log('----------------------------------');
    console.log(`Cluster: ${_.size(cluster.workers)} workers`);
    console.log('Listening to port: ', port);
    console.log('----------------------------------');
});




function start() {

  var log = console.log;
  console.log = function(){
    var args = Array.prototype.slice.call(arguments);
      log.apply(console,[chalk.cyan(`[worker:${cluster.worker.id}]`)].concat(args));
  };

  //--------------------------------

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
