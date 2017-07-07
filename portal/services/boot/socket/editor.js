var _ = require('lodash');

module.exports = function(app) {

    var socket = app.portal.socket;
    var web = app.get('options').web;
    socket.on('connection', function(connection) {
        connection.on('content-change', function(data) {

            var accessToken = connection.request.accessToken;
            var listener = `content-change:${data.path}:${data.id}`;

            if(!accessToken){
              return;
            }

            data.actor = accessToken.userId;

            if(_.isString(data.value)){
                data.value = web.app.locals.render(data.value);
            }

            socket.emit(listener, data);

        });

    });

};
