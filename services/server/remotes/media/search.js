const Promise = require('bluebird');

module.exports = function(Model) {

    Model.search = function(text, keywords) {

        var result;

        return Model.engine.find({
                keywords: keywords,
                where: {
                    isSize: false
                },
                fields: {
                    location_keywords: false,
                }
            })
            .then(function(_result) {
                result = _result;
                return Promise.map(result.items, function(item) {
                    return Model.__prepareObject(item);
                });
            })
            .then(function(items) {
                result.items = items;
                return result;
            });

    };

};
