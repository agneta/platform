const path = require('path');

module.exports = function(app) {

    app.requireServices = function(reqPath) {
        return require(
            path.join(__dirname, '..', reqPath)
        );
    };

};
