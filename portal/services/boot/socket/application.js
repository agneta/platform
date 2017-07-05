module.exports = function(app) {

    var socket = app.portal.socket;

    process.on('message', function(msg) {
        if (msg.workers) {
            socket.emit('application:workers', msg.workers);
        }
    });


};
