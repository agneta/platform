var Promise = require("bluebird");
var _ = require("lodash");

module.exports = function(app, models) {

    var Position = models.position;
    var Page = models.source;
    var Field = models.field;
    var Keyword = models.keyword;

    return function(options) {

        var keywords = options.keywords;

        //--------------------------------------------------

        var keywordsValues = [];
        var whereKeywords;

        for (var keyword of keywords) {
            keywordsValues.push({
                value: keyword
            });
        }

        var where = {
            and: []
        };

        if (options.language) {
            where.and.push({
                lang: options.language
            });
        }

        where.and.push({
            or: keywordsValues
        });

        return Keyword.find({
                fields: {
                    value: true,
                    id: true
                },
                where: where
            })
            .then(function(keywords) {

                //////////////////////////////////////////

                if (!keywords.length) {
                    return Promise.resolve({
                        notfound: 'Could not find a keyword'
                    });
                }

                whereKeywords = _.transform(keywords, function(result, value) {
                    result.push({
                        keywordId: value.id
                    });
                }, []);

                var value = _.map(keywords, function(keyword) {
                    return "\"" + keyword.value + "\"";
                }).join(' ');

                //---------------------------------------

                var findWhere = {
                    $text: {
                        $search: value
                    }
                };

                if (options.where) {
                    _.extend(findWhere, options.where);
                }

                if (options.language) {
                    findWhere.lang = options.language;
                }

                //---------------------------------------

                var findFields = {
                    score: {
                        $meta: "textScore"
                    }
                };

                if (options.fields) {
                    _.extend(findFields, options.fields);
                }

                return Keyword.dataSource.connector.collection(Page.definition.name)
                    .find(findWhere, findFields)
                    .sort({
                        score: {
                            $meta: "textScore"
                        }
                    })
                    .limit(10)
                    .toArray()
                    .then(function(pages) {

                        return Promise.mapSeries(pages, function(page) {

                                page.title = {
                                    value: page.title
                                };
                                page.id = page._id;

                                return Position.find({
                                        fields: {
                                            keywordId: false,
                                            pageId: false,
                                            value: false
                                        },
                                        where: {
                                            and: [{
                                                pageId: page._id
                                            }, {
                                                or: whereKeywords
                                            }]
                                        },
                                        limit: 20
                                    })
                                    .then(function(positions) {

                                        positions = _.groupBy(positions, 'fieldId');
                                        positions = _.values(positions);
                                        var fieldPositions = _.sortBy(positions, 'length')[positions.length - 1];

                                        if (!fieldPositions) {
                                            return;
                                        }

                                        var fieldId = fieldPositions[0].fieldId;

                                        fieldPositions = _.map(fieldPositions, function(n) {
                                            return {
                                                value: n.value,
                                                original: n.original
                                            };
                                        });

                                        return Field.findById(fieldId)
                                            .then(function(field) {

                                                var words = _.map(fieldPositions, 'original').join(' ');
                                                page.words = words;

                                                if (field.type != "title") {
                                                    page.content = {
                                                        value: field.value,
                                                        type: field.type,
                                                    };
                                                }
                                            });

                                    })
                                    .then(function() {

                                        if (!page.content) {
                                            page.content = {
                                                value: page.description
                                            };
                                        }

                                        delete page.description;
                                        delete page._id;
                                        return page;
                                    });
                            })
                            .then(function(items) {
                                return {
                                    items: items
                                };
                            });
                    });
            });


    };

};
