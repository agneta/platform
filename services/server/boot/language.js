var _ = require("lodash");

module.exports = function(app) {

    var client = app.get('options').client;
    var helpers = client.app.locals;

    app.getLng = function(req) {
        if (req.query && req.query.language) {
            return req.query.language;
        }

        if (req.body && req.body.language) {
            return req.body.language;
        }

        return 'en';
    };

    app.lng = function(obj, lng) {

        if (_.isObject(lng)) {
            lng = app.getLng(lng);
        }

        if (_.isObject(obj)) {
            obj = obj.__value || obj;
        }

        var result = lng ? obj[lng] : null;

        return result || obj.en || obj.gr;
    };

    app.lngScan = function(obj, lng) {

        if (_.isObject(lng)) {
            lng = app.getLng(lng);
        }

        return helpers.lngScan(obj, lng);
    };

};
