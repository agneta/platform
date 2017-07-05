module.exports = function(app) {

    app.git = {
        name: '.git'
    };

    app.requirePortal('services/boot/git/addAll')(app);
    app.requirePortal('services/boot/git/update')(app);
    app.requirePortal('services/boot/git/credentials')(app);

    require('./init')(app);
};
