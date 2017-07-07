module.exports = function(app) {

    if (!app.socket) {
        return;
    }

    //-------------------------------------------

    var mediaOptions = {
        name: 'media',
        auth: {
            allow: ['editor']
        }
    };

    app.models.Media_Private.io = app.socket.namespace(mediaOptions);
    app.models.Media.io = app.socket.namespace(mediaOptions);

    //-------------------------------------------

    app.models.Utility.io = app.socket.namespace({
        name: 'utilities',
        auth: {
            allow: [
                'administrator'
            ]
        }
    });

    //-------------------------------------------

    app.portal = app.portal || {};

    app.portal.socket = app.socket.namespace({
        name: 'portal'
    });

    //-------------------------------------------

    require('./socket/memory')(app);
    require('./socket/activity')(app);
    require('./socket/editor')(app);
    require('./socket/activities')(app);

};
