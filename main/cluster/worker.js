const cluster = require('cluster');
const express = require('express');
const loopback = require('loopback');
const chalk = require('chalk');

module.exports.run = function(worker) {

    var app;
    var server;

    switch (process.env.MODE) {
        case 'services':
            app = loopback();
            server = require('../server/services');
            break;
        default:
            app = express();
            server = require('../server/portal');
            break;
    }

    //--------------------------------

    var log = console.log;

    console.log = function() {
        var args = Array.prototype.slice.call(arguments);
        log.apply(console, [chalk.cyan(`[worker:${cluster.worker.id}]`)].concat(args));
    };

    var httpServer = worker.httpServer;
    var starting = true;
    httpServer.on('request', app);

    app.use(function(req, res, next) {
        if (starting) {
            return res.send('Starting the Application. Try refreshing again in a couple of seconds.');
        }
        next();
    });

    server({
            worker: worker,
            server: httpServer,
            app: app
        })
        .then(function() {
            starting = false;
            console.log(chalk.bold.green('Application is available'));

            process.send({
                started: true
            });
        });

};
