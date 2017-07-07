const cluster = require('cluster');
const chalk = require('chalk');

module.exports.run = function(socketCluster) {

    socketCluster.on('ready', function() {
        console.log('Listening');
    });

    socketCluster.on('workerMessage', function(workerId, msg) {
        if (msg.started) {
            sendStatus();
        }
        if (msg.restart) {
            console.log('TODO: restart apps');
            sendStatus();
        }
    });

    socketCluster.on('workerStart', function() {
        sendStatus();
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


};
