const _ = require('lodash');
const Promise = require('bluebird');
const Keywords = require('../search/lib/keywords');

module.exports = function(util, options) {

    var limit = 200;

    var where = {
        isSize: false
    };

    var bar;
    var searchItems = [];
    var count;

    var keywords = Keywords(util, {
        model: {
            keyword: 'Media_Keyword',
            source: 'Media'
        },
        filename: function(options) {
            return 'keywords_media';
        },
        title: 'location.value',
        outputJson: util.locals.project.paths.portalGenerated
    });

    function getItems(skip) {

        skip = skip || 0;
        return options.model.find({
                where: where,
                fields: {
                    id: true,
                    location: true
                },
                limit: limit,
                skip: skip
            })
            .then(function(objects) {
                return Promise.map(objects, function(object) {

                    bar.tick({
                        title: object.location
                    });

                    searchItems.push({
                        location: keywords.scan(object.location, 'title')
                    });

                });
            })
            .then(function(result) {
                var _skip = skip + limit;
                if (count <= _skip) {
                    return;
                }
                return getItems(_skip);
            });

    }

    return options.model.count(where)
        .then(function(_count) {
            count = _count;
            bar = util.progress(count, {
                title: 'Scanning media search items'
            });

            return getItems();
        })
        .then(function() {
            return Promise.all([
                keywords.deploy(searchItems),
                keywords.json()
            ]);
        });

};
