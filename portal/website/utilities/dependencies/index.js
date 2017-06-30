var generate = require('./generate');
var deploy = require('./deploy');

module.exports = function(util) {

    return {
        run: function(options) {

            return generate(util)
                .then(function() {
                    return deploy(util);
                });

        }
    };

};
