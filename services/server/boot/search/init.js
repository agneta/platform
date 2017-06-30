var Promise = require("bluebird");
var _ = require("lodash");

module.exports = function(app) {

    return function(options) {

        var models = {
            source: app.models[options.models.source],
            field: app.models[options.models.field],
            keyword: app.models[options.models.keyword],
            position: app.models[options.models.position]
        };

        require('./methods_keyword')(models.keyword,app,models);
        require('./methods_source')(models.source,app,models);

    };

};
