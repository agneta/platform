'use strict';

const cluster = require('cluster');
const _ = require('lodash');
const Promise = require('bluebird');
const debug = require('debug')('sticky:master');
const os = require('os');

module.exports = function(workerCount, env) {

    var starting;
    var workers = [];

    env = env || {};
    workerCount = workerCount || os.cpus().length;

    console.log(`Starting ${workerCount} workers`);

    Promise.each(_.times(workerCount), function() {
        var worker = spawnWorker();
        return new Promise(function(resolve) {

            worker.on('message', function(msg) {
                if (msg.started) {
                    resolve();
                }
            });

        });

    });

    function spawnWorker() {

        var worker = cluster.fork(env);

        worker.on('exit', function(code) {
            console.log('worker exited', code);
            debug('worker=%d died with code=%d', worker.process.pid, code);
            sendStatus();
            respawn(worker);
        });

        worker.on('online', function() {
            sendStatus();
        });

        worker.on('message', function(msg) {
            // Graceful exit
            if (msg.type === 'close') {
                respawn(worker);
            }

            if (msg.restart) {

                Promise.each(_.keys(cluster.workers), function(key) {
                    var worker = cluster.workers[key];

                    return new Promise(function(resolve, reject) {

                        starting = {
                            worker: worker,
                            resolve: resolve,
                            reject: reject,
                        };

                        worker.send({
                            exit: true
                        });

                    });
                });
            }

        });

        function sendStatus() {

            var result = [];
            var id;
            var worker;

            for (id in cluster.workers) {
                worker = cluster.workers[id];
                result.push({
                    id: worker.id,
                    connected: worker.isConnected(),
                    dead: worker.isDead()
                });
            }

            for (id in cluster.workers) {
                worker = cluster.workers[id];
                if (worker.isConnected()) {
                    worker.send({
                        workers: result
                    });
                }
            }

        }

        workers.push(worker);

        debug('worker=%d spawn', worker.process.pid);

        return worker;
    }

    function respawn(worker) {
        var index = workers.indexOf(worker);
        if (index !== -1)
            workers.splice(index, 1);

        var newWorker = spawnWorker();

        if (starting) {
            if (starting.worker.id != worker.id) {
                throw new Error('Workers do not have the same ID');
            }
            newWorker.on('message', function(msg) {
                if (msg.started) {
                    starting.resolve();
                }
            });
        }

    }
};
