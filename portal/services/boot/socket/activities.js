var _ = require('lodash');

module.exports = function(app) {

    var socket = app.portal.socket;
    var services = app.get('options').web.services;

    services.models.Activity_Feed.on('activity-update', function(feed) {
        app.portal.socket.emit('feed-update:' + feed.id);
    });

};
