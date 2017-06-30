var Promise = require("bluebird");
var _ = require("lodash");

module.exports = function(Model, app, models) {

    var Field = models.field;
    var Keyword = models.keyword;

    Model.engine = {
        find: require('./find')(app, models)
    };

    Model.remoteMethod(
        'search', {
            description: 'Search for a page using fuzzy search capabilities',
            accepts: [{
                arg: 'text',
                type: 'string',
                required: true
            }, {
                arg: 'keywords',
                type: 'array',
                required: true
            }, {
                arg: 'req',
                type: 'object',
                'http': {
                    source: 'req'
                }
            }],
            returns: {
                arg: 'result',
                type: 'object',
                root: true
            },
            http: {
                verb: 'get',
                path: '/search'
            }
        }
    );

    Model._getKeywords = function(data) {
        var keywords = _.map(data, 'keyword');
        return _.uniq(keywords);
    };

    Model._add = function(options) {
        var include = options.include || {};
        var language = options.language || 'en';

        var fields = {
            id: true
        };

        _.extend(fields, include);

        return Model.findOne({
                where: options.where,
                fields: fields
            })
            .then(function(page) {

                if (page) {
                    return page.updateAttributes(options.attributes);
                } else {
                    if (options.findOnly) {
                        console.log(options.where);
                        throw new Error('Could not find search item');
                    } else {
                        return Model.create(options.attributes);
                    }
                }

            })
            .then(function(page) {

                return Promise.map(options.fields, function(field, fieldIndex) {

                    return Field.create({
                            value: field.value,
                            type: field.type
                        })
                        .then(function(fieldRecord) {

                            return Promise.map(field.positions, function(position) {
                                var keywordProps = {
                                    value: position.keyword,
                                    lang: language
                                };
                                return Keyword.create(keywordProps)
                                    .catch(function(err) {

                                        return Keyword.findOne({
                                            where: keywordProps
                                        });

                                    })
                                    .then(function(keyword) {

                                        if (!keyword) {
                                            throw new Error('Could not find keyword: ' + position.keyword);
                                        }

                                        var properties = {
                                            value: position.value,
                                            original: position.original,
                                            fieldIndex: fieldIndex,
                                            keywordId: keyword.id,
                                            pageId: page.id,
                                            fieldId: fieldRecord.id
                                        };

                                        return keyword.positions.create(properties);

                                    }, {
                                        concurrency: 10
                                    });
                            });
                        });
                }, {
                    concurrency: 10
                });
            })
            .then(function() {
                return {
                    success: 'Added search data for the page'
                };
            });
    };

};
