module.exports = function(app) {

    app.git.addAll = function() {

        return app.git.native.add('./*');

    };

};
