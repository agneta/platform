var prettyBytes = require('pretty-bytes');
var _ = require('lodash');

module.exports = function(app) {

    app.portal = app.portal || {};

    app.portal.socket = app.io.create({
        name: 'portal'
    });

    require('./socket/memory')(app);
    require('./socket/activity')(app);
    require('./socket/editor')(app);
    require('./socket/activities')(app);

};
